/**
 * Seed inicial — crea un usuario demo + finca + geocerca + 3 animales con collares.
 * Ejecutar con: npm run seed
 *
 * Usuario demo:
 *   correo: demo@smartfence.ai
 *   contraseña: demo1234
 */
import bcrypt from "bcryptjs";
import { pool } from "./pool.js";

async function seed() {
  console.log("🌱 Iniciando seed...");

  // Usuario demo
  const claveHash = await bcrypt.hash("demo1234", 10);
  const { rows: usuarios } = await pool.query(`
    INSERT INTO usuarios (nombre, correo, clave_hash, rol)
    VALUES ('Ganadero Demo', 'demo@smartfence.ai', $1, 'ganadero')
    ON CONFLICT (correo) DO UPDATE SET clave_hash = $1
    RETURNING id
  `, [claveHash]);
  const usuarioId = usuarios[0].id;
  console.log("  ✅ Usuario demo creado:", usuarioId);

  // Finca demo (Antioquia, Colombia)
  const { rows: fincas } = await pool.query(`
    INSERT INTO fincas (nombre, propietario_id)
    VALUES ('Finca El Progreso', $1)
    ON CONFLICT DO NOTHING
    RETURNING id
  `, [usuarioId]);
  let fincaId = fincas[0]?.id;
  if (!fincaId) {
    const f = await pool.query("SELECT id FROM fincas WHERE propietario_id = $1 LIMIT 1", [usuarioId]);
    fincaId = f.rows[0].id;
  }
  console.log("  ✅ Finca creada:", fincaId);

  // Geocerca principal
  const poligono = "SRID=4326;POLYGON((-75.586 6.2085,-75.5834 6.2101,-75.5798 6.209,-75.5785 6.2058,-75.5805 6.203,-75.5838 6.2022,-75.5862 6.2045,-75.586 6.2085))";
  await pool.query(`
    INSERT INTO cercas (nombre, activa, es_principal, poligono, finca_id)
    VALUES ('Potrero Principal', true, true, ST_GeogFromText($1), $2)
    ON CONFLICT DO NOTHING
  `, [poligono, fincaId]);
  console.log("  ✅ Geocerca creada");

  // Animales y collares de prueba
  const animales = [
    { nombre: "Lucero", raza: "Holstein", peso: 420, collar: "SF-1001", lat: 6.2065, lng: -75.583 },
    { nombre: "Canela", raza: "Cebú",     peso: 380, collar: "SF-1002", lat: 6.208,  lng: -75.5815 },
    { nombre: "Trueno", raza: "Brahman",  peso: 510, collar: "SF-1003", lat: 6.2095, lng: -75.585 },
  ];

  for (const a of animales) {
    const { rows: aRows } = await pool.query(`
      INSERT INTO animales (nombre, raza, peso, salud, estado, finca_id)
      VALUES ($1, $2, $3, 'Buena', 'ACTIVO', $4)
      ON CONFLICT DO NOTHING
      RETURNING id
    `, [a.nombre, a.raza, a.peso, fincaId]);

    let animalId = aRows[0]?.id;
    if (!animalId) {
      const ex = await pool.query("SELECT id FROM animales WHERE nombre = $1 AND finca_id = $2", [a.nombre, fincaId]);
      animalId = ex.rows[0]?.id;
    }
    if (!animalId) continue;

    await pool.query(`
      INSERT INTO collares (id, serial, animal_id, finca_id, bateria, activo,
        ultima_ubicacion)
      VALUES ($1, $2, $3, $4, 85,  true,
        ST_SetSRID(ST_MakePoint($5, $6), 4326)::geography)
      ON CONFLICT (id) DO UPDATE
        SET animal_id = $3, ultima_ubicacion = ST_SetSRID(ST_MakePoint($5,$6),4326)::geography
    `, [a.collar, a.collar, animalId, fincaId, a.lng, a.lat]);

    console.log(`  ✅ Animal ${a.nombre} + collar ${a.collar}`);
  }

  console.log("\n🎉 Seed completado.");
  console.log("   Usuario: demo@smartfence.ai / demo1234");
  await pool.end();
}

seed().catch((err) => {
  console.error("❌ Error en seed:", err);
  process.exit(1);
});
