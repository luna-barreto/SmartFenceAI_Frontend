import { Router } from "express";
import { pool } from "../db/pool.js";

export const gpsRouter = Router();

// GET /api/gps/vivo?fincaId=xxx
// Devuelve la última posición de cada collar activo de la finca.
gpsRouter.get("/vivo", async (req, res) => {
  const { fincaId } = req.query;
  try {
    const { rows } = await pool.query(`
      SELECT
        c.id, c.serial, c.finca_id AS "fincaId", c.animal_id AS "animalId",
        c.bateria AS "bateriaPorcentaje", c.señal AS "senalCalidad",
        c.protocolo, c.ultima_conexion AS "fechaUltimoReporte",
        c.creado_en AS "fechaRegistro", c.activo,
        a.nombre AS "animalNombre", a.codigo AS "animalCodigo",
        ST_Y(c.ultima_ubicacion::geometry) AS lat,
        ST_X(c.ultima_ubicacion::geometry) AS lng,
        EXISTS (
          SELECT 1 FROM cercas ce
          WHERE ce.activa = true AND ce.es_principal = true
            AND (ce.finca_id IS NULL OR ce.finca_id = c.finca_id)
            AND ST_Contains(ce.poligono::geometry, c.ultima_ubicacion::geometry)
        ) AS "dentroDeCerca"
      FROM collares c
      LEFT JOIN animales a ON a.id = c.animal_id
      WHERE c.activo = true
        AND ($1::uuid IS NULL OR c.finca_id = $1::uuid)
        AND c.ultima_ubicacion IS NOT NULL
      ORDER BY c.ultima_conexion DESC
    `, [fincaId ?? null]);

    res.json(rows.map(r => ({
      collar: {
        id: r.id,
        serial: r.serial,
        fincaId: r.fincaId,
        animalId: r.animalId,
        bateriaPorcentaje: r.bateriaPorcentaje,
        senalCalidad: r.senalCalidad ?? "Buena",
        protocolo: r.protocolo ?? "LoRa",
        fechaUltimoReporte: r.fechaUltimoReporte,
        fechaRegistro: r.fechaRegistro,
        activo: r.activo,
        animal: r.animalId ? { id: r.animalId, nombre: r.animalNombre, codigo: r.animalCodigo } : null,
      },
      posicion: r.lat != null ? {
        lat: r.lat,
        lng: r.lng,
        dentroDeCerca: r.dentroDeCerca ?? false,
        fecha: r.fechaUltimoReporte ?? new Date().toISOString(),
      } : null,
    })));
  } catch (err) {
    console.error("[gps/vivo]", err);
    res.status(500).json({ mensaje: "Error al obtener posiciones" });
  }
});

// GET /api/gps/historial?collarId=xxx&desde=ISO&hasta=ISO
gpsRouter.get("/historial", async (req, res) => {
  const { collarId, desde, hasta } = req.query;
  if (!collarId) return res.status(400).json({ mensaje: "collarId es requerido" });
  try {
    const { rows } = await pool.query(`
      SELECT
        t.id, t.collar_id AS "collarId",
        ST_Y(t.ubicacion::geometry) AS lat,
        ST_X(t.ubicacion::geometry) AS lng,
        t.bateria,
        t.creado_en AS fecha
      FROM telemetria t
      WHERE t.collar_id = $1
        AND ($2::timestamptz IS NULL OR t.creado_en >= $2::timestamptz)
        AND ($3::timestamptz IS NULL OR t.creado_en <= $3::timestamptz)
      ORDER BY t.creado_en ASC
      LIMIT 500
    `, [collarId, desde ?? null, hasta ?? null]);

    res.json(rows);
  } catch (err) {
    console.error("[gps/historial]", err);
    res.status(500).json({ mensaje: "Error al obtener historial" });
  }
});
