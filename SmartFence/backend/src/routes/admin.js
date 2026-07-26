import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db/pool.js";

export const adminRouter = Router();

// ── Middleware: solo ADMINISTRADOR ────────────────────────────────────────────
function soloAdmin(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token requerido" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuarioId = payload.id;
  } catch {
    return res.status(401).json({ message: "Token inválido" });
  }
  // Verificar rol en BD (no confiar solo en el token)
  pool.query("SELECT rol FROM usuarios WHERE id = $1", [req.usuarioId])
    .then(({ rows }) => {
      if (!rows[0] || rows[0].rol?.toUpperCase() !== "ADMINISTRADOR") {
        return res.status(403).json({ message: "Acceso restringido a administradores" });
      }
      next();
    })
    .catch(() => res.status(500).json({ message: "Error interno" }));
}

adminRouter.use(soloAdmin);

// ═══════════════════════════════════════════════════════
//  USUARIOS
// ═══════════════════════════════════════════════════════

// GET /api/admin/usuarios
adminRouter.get("/usuarios", async (_req, res) => {
  try {
    const { rows: usuarios } = await pool.query(`
      SELECT
        u.id, u.nombre, u.correo AS email, u.rol,
        u.creado_en AS "fechaCreacion",
        COALESCE(
          json_agg(json_build_object('id', f.id, 'nombre', f.nombre))
          FILTER (WHERE f.id IS NOT NULL), '[]'
        ) AS fincas,
        COUNT(f.id)::int AS finca_count
      FROM usuarios u
      LEFT JOIN fincas f ON f.propietario_id = u.id
      GROUP BY u.id
      ORDER BY u.creado_en DESC
    `);

    res.json(usuarios.map((u) => ({
      id: u.id,
      nombre: u.nombre,
      email: u.email,
      rol: u.rol ?? "GANADERO",
      activo: true,
      fechaCreacion: u.fechaCreacion,
      fincas: u.fincas,
      _count: { fincas: u.finca_count },
    })));
  } catch (err) {
    console.error("[admin/usuarios GET]", err);
    res.status(500).json({ message: "Error al listar usuarios" });
  }
});

// POST /api/admin/usuarios
adminRouter.post("/usuarios", async (req, res) => {
  const { nombre, email, contrasena, rol = "GANADERO", fincaId } = req.body;
  if (!nombre?.trim()) return res.status(400).json({ message: "El nombre es obligatorio" });
  if (!email?.trim())  return res.status(400).json({ message: "El correo es obligatorio" });
  if (!contrasena || contrasena.length < 6)
    return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const existe = await client.query("SELECT id FROM usuarios WHERE correo = $1", [email.trim()]);
    if (existe.rows.length > 0)
      return res.status(409).json({ message: "El correo ya está registrado" });

    const claveHash = await bcrypt.hash(contrasena, 10);
    const { rows } = await client.query(
      `INSERT INTO usuarios (nombre, correo, clave_hash, rol)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nombre, correo AS email, rol, creado_en AS "fechaCreacion"`,
      [nombre.trim(), email.trim(), claveHash, rol.toUpperCase()]
    );
    const usuario = rows[0];

    if (fincaId) {
      await client.query(
        "UPDATE fincas SET propietario_id = $1 WHERE id = $2",
        [usuario.id, fincaId]
      );
    }

    await client.query("COMMIT");

    const { rows: fincas } = await pool.query(
      "SELECT id, nombre FROM fincas WHERE propietario_id = $1",
      [usuario.id]
    );
    res.status(201).json({
      ...usuario,
      activo: true,
      fincas,
      _count: { fincas: fincas.length },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[admin/usuarios POST]", err);
    res.status(500).json({ message: "Error al crear usuario" });
  } finally {
    client.release();
  }
});

// PATCH /api/admin/usuarios/:id
adminRouter.patch("/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, email, contrasena, rol, fincaId } = req.body;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const sets = [];
    const vals = [];
    let idx = 1;
    if (nombre?.trim())  { sets.push(`nombre = $${idx++}`);     vals.push(nombre.trim()); }
    if (email?.trim())   { sets.push(`correo = $${idx++}`);     vals.push(email.trim()); }
    if (rol)             { sets.push(`rol = $${idx++}`);        vals.push(rol.toUpperCase()); }
    if (contrasena)      {
      const hash = await bcrypt.hash(contrasena, 10);
      sets.push(`clave_hash = $${idx++}`);
      vals.push(hash);
    }

    if (sets.length > 0) {
      vals.push(id);
      const { rows } = await client.query(
        `UPDATE usuarios SET ${sets.join(", ")} WHERE id = $${idx} RETURNING id`,
        vals
      );
      if (!rows[0]) {
        await client.query("ROLLBACK");
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
    }

    // Reasignar finca si se envió (null = quitar asignación)
    if (fincaId !== undefined) {
      await client.query("UPDATE fincas SET propietario_id = NULL WHERE propietario_id = $1", [id]);
      if (fincaId) {
        await client.query("UPDATE fincas SET propietario_id = $1 WHERE id = $2", [id, fincaId]);
      }
    }

    await client.query("COMMIT");

    const { rows: [usuario] } = await pool.query(
      "SELECT id, nombre, correo AS email, rol, creado_en AS \"fechaCreacion\" FROM usuarios WHERE id = $1",
      [id]
    );
    const { rows: fincas } = await pool.query(
      "SELECT id, nombre FROM fincas WHERE propietario_id = $1",
      [id]
    );
    res.json({ ...usuario, activo: true, fincas, _count: { fincas: fincas.length } });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[admin/usuarios PATCH]", err);
    res.status(500).json({ message: "Error al actualizar usuario" });
  } finally {
    client.release();
  }
});

// DELETE /api/admin/usuarios/:id
adminRouter.delete("/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  if (id === req.usuarioId)
    return res.status(400).json({ message: "No puedes eliminarte a ti mismo" });
  try {
    const { rowCount } = await pool.query("DELETE FROM usuarios WHERE id = $1", [id]);
    if (!rowCount) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ ok: true });
  } catch (err) {
    console.error("[admin/usuarios DELETE]", err);
    res.status(500).json({ message: "Error al eliminar usuario" });
  }
});

// ═══════════════════════════════════════════════════════
//  FINCAS
// ═══════════════════════════════════════════════════════

// GET /api/admin/fincas
adminRouter.get("/fincas", async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        f.id,
        f.nombre,
        json_build_object('id', u.id, 'nombre', u.nombre, 'email', u.correo) AS propietario,
        (SELECT COUNT(*)::int FROM animales  WHERE finca_id = f.id) AS cnt_animales,
        (SELECT COUNT(*)::int FROM collares  WHERE finca_id = f.id) AS cnt_collares,
        (SELECT COUNT(*)::int FROM cercas    WHERE finca_id = f.id) AS cnt_geocercas
      FROM fincas f
      LEFT JOIN usuarios u ON u.id = f.propietario_id
      ORDER BY f.nombre
    `);
    res.json(rows.map((r) => ({
      id: r.id,
      nombre: r.nombre,
      propietario: r.propietario?.id ? r.propietario : null,
      _count: {
        animales:   r.cnt_animales,
        collares:   r.cnt_collares,
        geocercas:  r.cnt_geocercas,
      },
    })));
  } catch (err) {
    console.error("[admin/fincas GET]", err);
    res.status(500).json({ message: "Error al listar fincas" });
  }
});

// POST /api/admin/fincas
adminRouter.post("/fincas", async (req, res) => {
  const { nombre, propietarioId } = req.body;
  if (!nombre?.trim()) return res.status(400).json({ message: "El nombre de la finca es obligatorio" });
  try {
    const { rows } = await pool.query(
      `INSERT INTO fincas (nombre, propietario_id) VALUES ($1, $2)
       RETURNING id, nombre`,
      [nombre.trim(), propietarioId ?? null]
    );
    const finca = rows[0];
    let propietario = null;
    if (propietarioId) {
      const { rows: [u] } = await pool.query(
        "SELECT id, nombre, correo AS email FROM usuarios WHERE id = $1",
        [propietarioId]
      );
      propietario = u ?? null;
    }
    res.status(201).json({
      ...finca,
      propietario,
      _count: { animales: 0, collares: 0, geocercas: 0 },
    });
  } catch (err) {
    console.error("[admin/fincas POST]", err);
    res.status(500).json({ message: "Error al crear finca" });
  }
});

// PATCH /api/admin/fincas/:id
adminRouter.patch("/fincas/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, propietarioId } = req.body;
  const sets = [];
  const vals = [];
  let idx = 1;
  if (nombre?.trim())          { sets.push(`nombre = $${idx++}`);         vals.push(nombre.trim()); }
  if (propietarioId !== undefined) { sets.push(`propietario_id = $${idx++}`); vals.push(propietarioId ?? null); }
  if (!sets.length) return res.status(400).json({ message: "Sin campos a actualizar" });
  vals.push(id);
  try {
    const { rows, rowCount } = await pool.query(
      `UPDATE fincas SET ${sets.join(", ")} WHERE id = $${idx} RETURNING id, nombre, propietario_id`,
      vals
    );
    if (!rowCount) return res.status(404).json({ message: "Finca no encontrada" });
    const finca = rows[0];

    let propietario = null;
    if (finca.propietario_id) {
      const { rows: [u] } = await pool.query(
        "SELECT id, nombre, correo AS email FROM usuarios WHERE id = $1",
        [finca.propietario_id]
      );
      propietario = u ?? null;
    }
    const { rows: [cnts] } = await pool.query(`
      SELECT
        (SELECT COUNT(*)::int FROM animales WHERE finca_id = $1) AS cnt_animales,
        (SELECT COUNT(*)::int FROM collares  WHERE finca_id = $1) AS cnt_collares,
        (SELECT COUNT(*)::int FROM cercas    WHERE finca_id = $1) AS cnt_geocercas
    `, [id]);

    res.json({
      id: finca.id, nombre: finca.nombre,
      propietario,
      _count: { animales: cnts.cnt_animales, collares: cnts.cnt_collares, geocercas: cnts.cnt_geocercas },
    });
  } catch (err) {
    console.error("[admin/fincas PATCH]", err);
    res.status(500).json({ message: "Error al actualizar finca" });
  }
});

// DELETE /api/admin/fincas/:id
adminRouter.delete("/fincas/:id", async (req, res) => {
  try {
    const { rowCount } = await pool.query("DELETE FROM fincas WHERE id = $1", [req.params.id]);
    if (!rowCount) return res.status(404).json({ message: "Finca no encontrada" });
    res.json({ ok: true });
  } catch (err) {
    console.error("[admin/fincas DELETE]", err);
    res.status(500).json({ message: "Error al eliminar finca" });
  }
});
