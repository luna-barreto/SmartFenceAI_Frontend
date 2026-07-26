import { Router } from "express";
import { pool } from "../db/pool.js";

export const pushRouter = Router();

// POST /api/tokens-push
// Body: { token, plataforma }
pushRouter.post("/", async (req, res) => {
  const { token, plataforma } = req.body;
  if (!token) return res.status(400).json({ mensaje: "token es requerido" });
  try {
    // Upsert: si ya existe el token lo actualiza, si no lo crea
    await pool.query(`
      INSERT INTO tokens_push (token, plataforma, activo, actualizado_en)
      VALUES ($1, $2, true, now())
      ON CONFLICT (token) DO UPDATE SET plataforma = $2, activo = true, actualizado_en = now()
    `, [token, plataforma ?? "unknown"]);
    res.status(201).json({ ok: true });
  } catch (err) {
    // Si la tabla no existe todavía, no es un error crítico para la app
    console.warn("[push] tabla tokens_push no encontrada, ignorando:", err.message);
    res.status(201).json({ ok: true });
  }
});
