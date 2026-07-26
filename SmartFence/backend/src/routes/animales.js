import { Router } from "express";
import { pool } from "../db/pool.js";

export const animalesRouter = Router();

// GET /api/animales?fincaId=xxx
animalesRouter.get("/", async (req, res) => {
  const { fincaId } = req.query;
  try {
    const { rows } = await pool.query(`
      SELECT
        a.id, a.codigo, a.nombre, a.raza, a.peso, a.salud, a.estado,
        a.finca_id AS "fincaId",
        c.id         AS "collarId",
        c.serial     AS "collarSerial",
        c.bateria    AS "collarBateria",
        c.señal      AS "collarSenal",
        c.protocolo  AS "collarProtocolo",
        c.ultima_conexion AS "collarUltimaConexion",
        ST_Y(c.ultima_ubicacion::geometry) AS lat,
        ST_X(c.ultima_ubicacion::geometry) AS lng,
        EXISTS (
          SELECT 1 FROM cercas ce
          WHERE ce.activa = true AND ce.es_principal = true
            AND (finca_id IS NULL OR ce.finca_id = a.finca_id)
            AND ST_Contains(ce.poligono::geometry, c.ultima_ubicacion::geometry)
        ) AS "dentroDeCerca"
      FROM animales a
      LEFT JOIN collares c ON c.animal_id = a.id
      WHERE ($1::uuid IS NULL OR a.finca_id = $1::uuid)
        AND a.estado = 'ACTIVO'
      ORDER BY a.nombre
    `, [fincaId ?? null]);

    res.json(rows.map(r => ({
      id: r.id,
      codigo: r.codigo ?? r.id.slice(0,6).toUpperCase(),
      nombre: r.nombre,
      raza: r.raza,
      peso: r.peso,
      salud: r.salud ?? "Buena",
      estado: r.estado ?? "ACTIVO",
      fincaId: r.fincaId,
      ubicacion: r.lat != null ? { lat: r.lat, lng: r.lng } : null,
      dentroDeCerca: r.dentroDeCerca ?? false,
      collar: r.collarId ? {
        id: r.collarId,
        serial: r.collarSerial,
        fincaId: r.fincaId,
        bateriaPorcentaje: r.collarBateria,
        bateria: r.collarBateria,
        señal: r.collarSenal ?? "Buena",
        protocolo: r.collarProtocolo ?? "LoRa",
        ultimaConexion: r.collarUltimaConexion,
        estado: "en_linea",
        activo: true,
      } : null,
    })));
  } catch (err) {
    console.error("[animales/GET]", err);
    res.status(500).json({ mensaje: "Error al listar animales" });
  }
});

// GET /api/animales/:id
animalesRouter.get("/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        a.id, a.codigo, a.nombre, a.raza, a.peso, a.salud, a.estado,
        a.finca_id AS "fincaId",
        c.id         AS "collarId",
        c.serial     AS "collarSerial",
        c.bateria    AS "collarBateria",
        c.señal      AS "collarSenal",
        c.protocolo  AS "collarProtocolo",
        c.ultima_conexion AS "collarUltimaConexion",
        ST_Y(c.ultima_ubicacion::geometry) AS lat,
        ST_X(c.ultima_ubicacion::geometry) AS lng
      FROM animales a
      LEFT JOIN collares c ON c.animal_id = a.id
      WHERE a.id = $1
    `, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ mensaje: "Animal no encontrado" });
    const r = rows[0];
    res.json({
      id: r.id, codigo: r.codigo, nombre: r.nombre, raza: r.raza,
      peso: r.peso, salud: r.salud, estado: r.estado, fincaId: r.fincaId,
      ubicacion: r.lat != null ? { lat: r.lat, lng: r.lng } : null,
      collar: r.collarId ? {
        id: r.collarId, serial: r.collarSerial, bateriaPorcentaje: r.collarBateria,
        bateria: r.collarBateria, señal: r.collarSenal, protocolo: r.collarProtocolo,
        ultimaConexion: r.collarUltimaConexion, estado: "en_linea", activo: true,
      } : null,
    });
  } catch (err) {
    console.error("[animales/GET/:id]", err);
    res.status(500).json({ mensaje: "Error al obtener animal" });
  }
});

// POST /api/animales
// Body: { codigo, nombre, raza, peso, fincaId }
animalesRouter.post("/", async (req, res) => {
  const { codigo, nombre, raza, peso, fincaId } = req.body;
  if (!nombre) return res.status(400).json({ mensaje: "nombre es requerido" });
  try {
    const { rows } = await pool.query(
      `INSERT INTO animales (codigo, nombre, raza, peso, finca_id, estado, salud)
       VALUES ($1, $2, $3, $4, $5, 'ACTIVO', 'Buena')
       RETURNING *`,
      [codigo ?? null, nombre, raza ?? null, peso ?? null, fincaId ?? null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("[animales/POST]", err);
    res.status(500).json({ mensaje: "Error al crear animal" });
  }
});

// POST /api/animales/con-collar
// Crea animal + registra collar + los vincula en una sola transacción.
// Body: { nombre, raza, peso, fincaId, collarSerial }
animalesRouter.post("/con-collar", async (req, res) => {
  const { nombre, raza, peso, fincaId, collarSerial } = req.body;
  if (!nombre)        return res.status(400).json({ mensaje: "nombre es requerido" });
  if (!collarSerial)  return res.status(400).json({ mensaje: "collarSerial es requerido" });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Crear animal
    const { rows: aRows } = await client.query(
      `INSERT INTO animales (nombre, raza, peso, finca_id, estado, salud)
       VALUES ($1, $2, $3, $4, 'ACTIVO', 'Buena') RETURNING *`,
      [nombre, raza ?? null, peso ?? null, fincaId ?? null]
    );
    const animal = aRows[0];

    // 2. Registrar collar (si ya existe, solo actualiza finca y activo)
    await client.query(
      `INSERT INTO collares (id, serial, finca_id, activo)
       VALUES ($1, $1, $2, true)
       ON CONFLICT (id) DO UPDATE SET finca_id = $2, activo = true`,
      [collarSerial, fincaId ?? null]
    );

    // 3. Desvincular collar de cualquier animal previo y vincular al nuevo
    await client.query("UPDATE collares SET animal_id = NULL WHERE animal_id = $1", [animal.id]);
    await client.query("UPDATE collares SET animal_id = $1 WHERE id = $2", [animal.id, collarSerial]);

    await client.query("COMMIT");

    res.status(201).json({
      animal: { ...animal, fincaId: animal.finca_id },
      collar: { id: collarSerial, serial: collarSerial, fincaId, animalId: animal.id },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[animales/con-collar]", err);
    res.status(500).json({ mensaje: "Error al registrar animal con collar" });
  } finally {
    client.release();
  }
});

// PATCH /api/animales/:id
animalesRouter.patch("/:id", async (req, res) => {
  const campos = req.body;
  const sets = [];
  const vals = [];
  let idx = 1;
  const mapa = { nombre: "nombre", raza: "raza", peso: "peso", salud: "salud", estado: "estado" };
  for (const [key, col] of Object.entries(mapa)) {
    if (campos[key] !== undefined) { sets.push(`${col} = $${idx++}`); vals.push(campos[key]); }
  }
  if (!sets.length) return res.status(400).json({ mensaje: "Sin campos a actualizar" });
  vals.push(req.params.id);
  try {
    const { rows } = await pool.query(
      `UPDATE animales SET ${sets.join(", ")} WHERE id = $${idx} RETURNING *`,
      vals
    );
    if (!rows[0]) return res.status(404).json({ mensaje: "Animal no encontrado" });
    res.json(rows[0]);
  } catch (err) {
    console.error("[animales/PATCH]", err);
    res.status(500).json({ mensaje: "Error al actualizar animal" });
  }
});
