import { Router } from "express";
import { pool } from "../db/pool.js";

export const collaresRouter = Router();

// GET /api/collares/disponibles?fincaId=xxx
// Collares registrados en la BD que aún no tienen animal asignado.
collaresRouter.get("/disponibles", async (req, res) => {
  const { fincaId } = req.query;
  try {
    const { rows } = await pool.query(`
      SELECT id, serial, finca_id AS "fincaId", bateria AS "bateriaPorcentaje",
             ultima_conexion AS "fechaUltimoReporte", activo
      FROM collares
      WHERE animal_id IS NULL
        AND ($1::uuid IS NULL OR finca_id = $1::uuid OR finca_id IS NULL)
      ORDER BY serial
    `, [fincaId ?? null]);
    res.json(rows);
  } catch (err) {
    console.error("[collares/disponibles]", err);
    res.status(500).json({ mensaje: "Error al listar collares disponibles" });
  }
});

// GET /api/collares?fincaId=xxx
collaresRouter.get("/", async (req, res) => {
  const { fincaId } = req.query;
  try {
    const { rows } = await pool.query(`
      SELECT
        c.id, c.serial, c.finca_id AS "fincaId", c.animal_id AS "animalId",
        c.bateria AS "bateriaPorcentaje", c.señal AS "senalCalidad",
        c.protocolo, c.ultima_conexion AS "fechaUltimoReporte",
        c.creado_en AS "fechaRegistro", c.activo,
        a.id AS "animalId2", a.nombre AS "animalNombre", a.codigo AS "animalCodigo",
        ST_Y(c.ultima_ubicacion::geometry) AS lat,
        ST_X(c.ultima_ubicacion::geometry) AS lng
      FROM collares c
      LEFT JOIN animales a ON a.id = c.animal_id
      WHERE ($1::uuid IS NULL OR c.finca_id = $1::uuid)
      ORDER BY c.serial
    `, [fincaId ?? null]);

    res.json(rows.map(r => ({
      id: r.id,
      serial: r.serial,
      fincaId: r.fincaId,
      animalId: r.animalId,
      bateriaPorcentaje: r.bateriaPorcentaje,
      senalCalidad: r.senalCalidad ?? "Buena",
      protocolo: r.protocolo ?? "LoRa",
      fechaUltimoReporte: r.fechaUltimoReporte,
      fechaRegistro: r.fechaRegistro,
      activo: r.activo ?? true,
      estado: "en_linea",
      animal: r.animalId2 ? { id: r.animalId2, nombre: r.animalNombre, codigo: r.animalCodigo } : null,
      ubicacion: r.lat != null ? { lat: r.lat, lng: r.lng } : null,
    })));
  } catch (err) {
    console.error("[collares/GET]", err);
    res.status(500).json({ mensaje: "Error al listar collares" });
  }
});

// POST /api/collares
// Body: { serial, fincaId }
collaresRouter.post("/", async (req, res) => {
  const { serial, fincaId } = req.body;
  if (!serial) return res.status(400).json({ mensaje: "serial es requerido" });
  try {
    const { rows } = await pool.query(
      `INSERT INTO collares (id, serial, finca_id, activo)
       VALUES ($1, $2, $3, true) RETURNING *`,
      [serial, serial, fincaId ?? null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("[collares/POST]", err);
    res.status(500).json({ mensaje: "Error al registrar collar" });
  }
});

// PUT /api/collares/:id/vincular-animal
collaresRouter.put("/:id/vincular-animal", async (req, res) => {
  const { animalId } = req.body;
  if (!animalId) return res.status(400).json({ mensaje: "animalId es requerido" });
  try {
    // Desvincular animal de collar previo si lo tenía
    await pool.query("UPDATE collares SET animal_id = NULL WHERE animal_id = $1", [animalId]);
    const { rows } = await pool.query(
      "UPDATE collares SET animal_id = $1 WHERE id = $2 RETURNING *",
      [animalId, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ mensaje: "Collar no encontrado" });
    res.json(rows[0]);
  } catch (err) {
    console.error("[collares/vincular]", err);
    res.status(500).json({ mensaje: "Error al vincular collar" });
  }
});
