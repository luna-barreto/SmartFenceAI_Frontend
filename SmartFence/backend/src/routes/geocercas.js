import { Router } from "express";
import { pool } from "../db/pool.js";

/**
 * CRUD de geocercas.
 *
 * Una vez guardada, la geocerca es la referencia permanente del sistema.
 * El backend la compara contra la posición GPS del collar (via ST_Contains).
 * La ubicación del teléfono del ganadero NO se usa en ninguna validación.
 */
export const geocercasRouter = Router();

// GET /api/geocercas?fincaId=xxx
geocercasRouter.get("/", async (req, res) => {
  const { fincaId } = req.query;
  try {
    const { rows } = await pool.query(`
      SELECT
        id, nombre, activa, es_principal AS "esPrincipal",
        finca_id AS "fincaId",
        creado_en AS "fechaCreacion",
        ST_AsGeoJSON(poligono::geometry)::json AS geojson
      FROM cercas
      WHERE ($1::uuid IS NULL OR finca_id = $1::uuid)
      ORDER BY es_principal DESC, nombre
    `, [fincaId ?? null]);

    res.json(rows.map(r => {
      // Extraer coordenadas del GeoJSON polygon
      const coords = r.geojson?.coordinates?.[0] ?? [];
      const coordenadas = coords.map(([lng, lat]) => ({ lat, lng }));
      return {
        id: r.id,
        nombre: r.nombre,
        activa: r.activa,
        esPrincipal: r.esPrincipal,
        fincaId: r.fincaId,
        fechaCreacion: r.fechaCreacion,
        coordenadas,
        puntos: coordenadas, // alias para compatibilidad frontend
      };
    }));
  } catch (err) {
    console.error("[geocercas/GET]", err);
    res.status(500).json({ mensaje: "Error al listar geocercas" });
  }
});

// POST /api/geocercas
// Body: { fincaId, nombre, coordenadas: [{lat, lng}] }
geocercasRouter.post("/", async (req, res) => {
  const { fincaId, nombre, coordenadas } = req.body;
  if (!nombre || !coordenadas?.length) {
    return res.status(400).json({ mensaje: "nombre y coordenadas son requeridos" });
  }
  try {
    const poligono = coordenadasAWkt(coordenadas);
    const { rows } = await pool.query(
      `INSERT INTO cercas (nombre, finca_id, activa, es_principal, poligono)
       VALUES ($1, $2, true, false, ST_GeogFromText($3))
       RETURNING id, nombre, activa, es_principal AS "esPrincipal", finca_id AS "fincaId", creado_en AS "fechaCreacion"`,
      [nombre, fincaId ?? null, poligono]
    );
    res.status(201).json({ ...rows[0], coordenadas, puntos: coordenadas });
  } catch (err) {
    console.error("[geocercas/POST]", err);
    res.status(500).json({ mensaje: "Error al crear geocerca" });
  }
});

// PUT /api/geocercas/:id
geocercasRouter.put("/:id", async (req, res) => {
  const { nombre, coordenadas, activa } = req.body;
  const sets = [];
  const vals = [];
  let idx = 1;
  if (nombre !== undefined) { sets.push(`nombre = $${idx++}`); vals.push(nombre); }
  if (activa !== undefined) { sets.push(`activa = $${idx++}`); vals.push(activa); }
  if (coordenadas?.length) {
    sets.push(`poligono = ST_GeogFromText($${idx++})`);
    vals.push(coordenadasAWkt(coordenadas));
  }
  if (!sets.length) return res.status(400).json({ mensaje: "Sin campos a actualizar" });
  vals.push(req.params.id);
  try {
    const { rows } = await pool.query(
      `UPDATE cercas SET ${sets.join(", ")} WHERE id = $${idx}
       RETURNING id, nombre, activa, es_principal AS "esPrincipal", finca_id AS "fincaId"`,
      vals
    );
    if (!rows[0]) return res.status(404).json({ mensaje: "Geocerca no encontrada" });
    res.json({ ...rows[0], coordenadas: coordenadas ?? [], puntos: coordenadas ?? [] });
  } catch (err) {
    console.error("[geocercas/PUT]", err);
    res.status(500).json({ mensaje: "Error al actualizar geocerca" });
  }
});

// DELETE /api/geocercas/:id
geocercasRouter.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM cercas WHERE id = $1", [req.params.id]);
    res.status(204).send();
  } catch (err) {
    console.error("[geocercas/DELETE]", err);
    res.status(500).json({ mensaje: "Error al eliminar geocerca" });
  }
});

function coordenadasAWkt(coordenadas) {
  // Cerrar el polígono: el primer y último punto deben coincidir
  const pts = [...coordenadas];
  if (pts[0].lat !== pts[pts.length - 1].lat || pts[0].lng !== pts[pts.length - 1].lng) {
    pts.push(pts[0]);
  }
  const anillo = pts.map(p => `${p.lng} ${p.lat}`).join(", ");
  return `SRID=4326;POLYGON((${anillo}))`;
}
