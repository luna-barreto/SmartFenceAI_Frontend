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

// Limitar workers para reducir uso de RAM en primera compilación
config.maxWorkers = 2;

module.exports = withNativeWind(config, { input: "./src/styles/global.css" });
