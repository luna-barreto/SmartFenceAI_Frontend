import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { pool } from "../db/pool.js";

export const authRouter = Router();

// POST /api/auth/login
// Body: { email, contrasena }  — el frontend envía estos campos
authRouter.post("/login", async (req, res) => {
  const { email, contrasena } = req.body;
  if (!email || !contrasena) {
    return res.status(400).json({ mensaje: "email y contrasena son requeridos" });
  }
  try {
    const { rows } = await pool.query(
      "SELECT * FROM usuarios WHERE correo = $1",
      [email]
    );
    const usuario = rows[0];
    if (!usuario || !(await bcrypt.compare(contrasena, usuario.clave_hash))) {
      return res.status(401).json({ mensaje: "Credenciales inválidas" });
    }

    // Obtener fincaId del usuario (primera finca asociada)
    const { rows: fincas } = await pool.query(
      "SELECT id, nombre FROM fincas WHERE propietario_id = $1 LIMIT 1",
      [usuario.id]
    );
    const finca = fincas[0];

    const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      tokenAcceso: token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.correo,
        correo: usuario.correo,
        rol: usuario.rol ?? "ganadero",
        finca: finca?.nombre,
        fincaId: finca?.id ?? null,
      },
    });
  } catch (err) {
    console.error("[auth/login]", err);
    res.status(500).json({ mensaje: "Error interno" });
  }
});

// POST /api/auth/registro
// Body: { nombre, email, contrasena }
authRouter.post("/registro", async (req, res) => {
  const { nombre, email, contrasena } = req.body;
  if (!nombre || !email || !contrasena) {
    return res.status(400).json({ mensaje: "nombre, email y contrasena son requeridos" });
  }
  try {
    const existe = await pool.query("SELECT id FROM usuarios WHERE correo = $1", [email]);
    if (existe.rows.length > 0) {
      return res.status(409).json({ mensaje: "El correo ya está registrado" });
    }
    const claveHash = await bcrypt.hash(contrasena, 10);
    const { rows } = await pool.query(
      "INSERT INTO usuarios (nombre, correo, clave_hash, rol) VALUES ($1,$2,$3,'ganadero') RETURNING id, nombre, correo, rol",
      [nombre, email, claveHash]
    );
    const usuario = rows[0];
    const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({
      tokenAcceso: token,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.correo, rol: usuario.rol, fincaId: null },
    });
  } catch (err) {
    console.error("[auth/registro]", err);
    res.status(500).json({ mensaje: "Error interno" });
  }
});

// POST /api/auth/perfil  (el frontend usa POST)
// GET  /api/auth/me      (alias compatible)
async function obtenerPerfil(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ mensaje: "Token requerido" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const { rows } = await pool.query(
      "SELECT id, nombre, correo, rol FROM usuarios WHERE id = $1",
      [payload.id]
    );
    if (!rows[0]) return res.status(404).json({ mensaje: "Usuario no encontrado" });

    const { rows: fincas } = await pool.query(
      "SELECT id, nombre FROM fincas WHERE propietario_id = $1 LIMIT 1",
      [payload.id]
    );
    const finca = fincas[0];
    res.json({
      id: rows[0].id,
      rol: rows[0].rol ?? "ganadero",
      nombre: rows[0].nombre,
      email: rows[0].correo,
      fincaId: finca?.id ?? null,
    });
  } catch {
    res.status(401).json({ mensaje: "Token inválido" });
  }
}
authRouter.post("/perfil", obtenerPerfil);
authRouter.get("/me", obtenerPerfil);
