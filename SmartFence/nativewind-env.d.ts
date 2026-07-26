/// <reference types="nativewind/types" />

// Assets HTML cargados con require() para el WebView
declare module "*.html" {
  const asset: number;
  export default asset;
}
