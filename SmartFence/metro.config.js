const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");
const os = require("os");

const config = getDefaultConfig(__dirname);

// Permitir assets .html (mapa Leaflet embebido)
config.resolver.assetExts = [...config.resolver.assetExts, "html"];

// Caché persistente en disco — evita recompilar módulos entre reinicios
config.cacheStores = [
  new (require("metro-cache").FileStore)({
    root: path.join(os.tmpdir(), "metro-cache-smartfence"),
  }),
];

// 2 workers — limita RAM; cada worker puede consumir 300-400MB con minificación
config.maxWorkers = 2;

module.exports = withNativeWind(config, { input: "./src/styles/global.css" });
