import { Router } from "express";
import { pool } from "../db/pool.js";

export const alertasRouter = Router();

// GET /api/alertas?fincaId=xxx&estado=PENDIENTE
alertasRouter.get("/", async (req, res) => {
  const { fincaId, estado } = req.query;
  try {
    const { rows } = await pool.query(`
      SELECT
        al.id, al.tipo, al.severidad, al.mensaje,
        al.animal_id AS "animalId", al.collar_id AS "collarId",
        al.estado, al.leida, al.resuelta,
        al.creado_en AS fecha,
        a.nombre AS "animalNombre"
      FROM alertas al
      LEFT JOIN animales a ON a.id = al.animal_id
      WHERE ($1::uuid IS NULL OR al.finca_id = $1::uuid)
        AND ($2::text IS NULL OR al.estado = $2)
      ORDER BY al.creado_en DESC
      LIMIT 100
    `, [fincaId ?? null, estado ?? null]);

    res.json(rows.map(r => ({
      id: r.id,
      tipo: r.tipo,
      severidad: r.severidad ?? "INFO",
      mensaje: r.mensaje,
      animalId: r.animalId,
      collarId: r.collarId,
      estado: r.estado ?? "PENDIENTE",
      leida: r.leida ?? false,
      resuelta: r.resuelta ?? false,
      fecha: r.fecha,
      animal: r.animalNombre ? { id: r.animalId, nombre: r.animalNombre } : null,
    })));
  } catch (err) {
    console.error("[alertas/GET]", err);
    res.status(500).json({ mensaje: "Error al listar alertas" });
  }
});

// PUT /api/alertas/:id/leida  (el frontend usa PUT)
alertasRouter.put("/:id/leida", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE alertas SET leida = true, estado = CASE WHEN estado = 'PENDIENTE' THEN 'RECONOCIDA' ELSE estado END
       WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ mensaje: "Alerta no encontrada" });
    res.json(rows[0]);
  } catch (err) {
    console.error("[alertas/leida]", err);
    res.status(500).json({ mensaje: "Error" });
  }
});

// PUT /api/alertas/:id/resolver  (el frontend usa PUT)
// PATCH /api/alertas/:id/resolver (alias)
async function resolver(req, res) {
  try {
    const { rows } = await pool.query(
      "UPDATE alertas SET resuelta = true, leida = true, estado = 'RESUELTA' WHERE id = $1 RETURNING *",
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ mensaje: "Alerta no encontrada" });
    res.json(rows[0]);
  } catch (err) {
    console.error("[alertas/resolver]", err);
    res.status(500).json({ mensaje: "Error" });
  }
}
alertasRouter.put("/:id/resolver", resolver);
alertasRouter.patch("/:id/resolver", resolver);

// DELETE /api/alertas/:id
alertasRouter.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM alertas WHERE id = $1", [req.params.id]);
    res.status(204).send();
  } catch (err) {
    console.error("[alertas/DELETE]", err);
    res.status(500).json({ mensaje: "Error al eliminar alerta" });
  }
});
