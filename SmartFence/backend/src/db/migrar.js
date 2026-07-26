// Ejecutar con: npm run migrate
import { pool } from "./pool.js";

const ESQUEMA = `
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Usuarios / ganaderos
CREATE TABLE IF NOT EXISTS usuarios (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      TEXT NOT NULL,
  correo      TEXT UNIQUE NOT NULL,
  clave_hash  TEXT NOT NULL,
  rol         TEXT NOT NULL DEFAULT 'ganadero',
  creado_en   TIMESTAMPTZ DEFAULT now()
);

-- Fincas (cada usuario puede tener una o más)
CREATE TABLE IF NOT EXISTS fincas (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre         TEXT NOT NULL,
  propietario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  creado_en      TIMESTAMPTZ DEFAULT now()
);

-- Geocercas (polígonos PostGIS)
CREATE TABLE IF NOT EXISTS cercas (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre       TEXT NOT NULL,
  activa       BOOLEAN DEFAULT true,
  es_principal BOOLEAN DEFAULT false,
  poligono     GEOGRAPHY(POLYGON, 4326) NOT NULL,
  finca_id     UUID REFERENCES fincas(id) ON DELETE CASCADE,
  creado_en    TIMESTAMPTZ DEFAULT now()
);

-- Animales del rebaño
CREATE TABLE IF NOT EXISTS animales (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo    TEXT,
  nombre    TEXT NOT NULL,
  raza      TEXT,
  peso      NUMERIC,
  salud     TEXT DEFAULT 'Buena',
  estado    TEXT DEFAULT 'ACTIVO',
  finca_id  UUID REFERENCES fincas(id) ON DELETE CASCADE,
  creado_en TIMESTAMPTZ DEFAULT now()
);

-- Collares GPS/LoRa
CREATE TABLE IF NOT EXISTS collares (
  id               TEXT PRIMARY KEY,
  serial           TEXT NOT NULL,
  animal_id        UUID REFERENCES animales(id) ON DELETE SET NULL,
  finca_id         UUID REFERENCES fincas(id) ON DELETE CASCADE,
  bateria          INT DEFAULT 100,
  señal            TEXT DEFAULT 'Buena',
  protocolo        TEXT DEFAULT 'LoRa',
  ultima_conexion  TIMESTAMPTZ DEFAULT now(),
  ultima_ubicacion GEOGRAPHY(POINT, 4326),
  activo           BOOLEAN DEFAULT true,
  creado_en        TIMESTAMPTZ DEFAULT now()
);

-- Historial de telemetría GPS (una fila por lectura)
CREATE TABLE IF NOT EXISTS telemetria (
  id         BIGSERIAL PRIMARY KEY,
  collar_id  TEXT REFERENCES collares(id) ON DELETE CASCADE,
  ubicacion  GEOGRAPHY(POINT, 4326) NOT NULL,
  bateria    INT,
  creado_en  TIMESTAMPTZ DEFAULT now()
);

-- Alertas del sistema
CREATE TABLE IF NOT EXISTS alertas (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo       TEXT NOT NULL,
  severidad  TEXT NOT NULL DEFAULT 'INFO',
  mensaje    TEXT NOT NULL,
  animal_id  UUID REFERENCES animales(id) ON DELETE SET NULL,
  collar_id  TEXT REFERENCES collares(id) ON DELETE SET NULL,
  finca_id   UUID REFERENCES fincas(id) ON DELETE CASCADE,
  estado     TEXT NOT NULL DEFAULT 'PENDIENTE',
  leida      BOOLEAN DEFAULT false,
  resuelta   BOOLEAN DEFAULT false,
  creado_en  TIMESTAMPTZ DEFAULT now()
);

-- Tokens push para notificaciones (Expo / FCM / APNs)
CREATE TABLE IF NOT EXISTS tokens_push (
  token         TEXT PRIMARY KEY,
  plataforma    TEXT,
  usuario_id    UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  activo        BOOLEAN DEFAULT true,
  actualizado_en TIMESTAMPTZ DEFAULT now()
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_telemetria_collar ON telemetria(collar_id, creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_alertas_finca     ON alertas(finca_id, creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_collares_finca    ON collares(finca_id);
CREATE INDEX IF NOT EXISTS idx_animales_finca    ON animales(finca_id);
`;

async function migrar() {
  try {
    await pool.query(ESQUEMA);
    console.log("✅ Esquema aplicado correctamente.");
  } catch (err) {
    console.error("❌ Error al aplicar esquema:", err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrar();
