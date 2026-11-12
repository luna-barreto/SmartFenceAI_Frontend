const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");
const os = require("os");

const config = getDefaultConfig(__dirname);

// Permitir assets .html (mapa Leaflet embebido)
config.resolver.assetExts = [...config.resolver.assetExts, "html"];

// Stub react-native-maps on web — its native MapView is not a valid web constructor
// and causes "x.Map is not a constructor" when bundled for web.
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === "web" && moduleName === "react-native-maps") {
    return { type: "sourceFile", filePath: path.resolve(__dirname, "src/mocks/react-native-maps.web.js") };
  }
  if (originalResolveRequest) return originalResolveRequest(context, moduleName, platform);
  return context.resolveRequest(context, moduleName, platform);
};

// Caché persistente en disco — evita recompilar módulos entre reinicios
config.cacheStores = [
  new (require("metro-cache").FileStore)({
    root: path.join(os.tmpdir(), "metro-cache-smartfence"),
  }),
];

// 2 workers — limita RAM; cada worker puede consumir 300-400MB con minificación
config.maxWorkers = 2;

module.exports = withNativeWind(config, { input: "./src/styles/global.css" });
