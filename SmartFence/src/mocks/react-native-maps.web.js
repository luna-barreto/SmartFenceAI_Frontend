// Web stub for react-native-maps — the native MapView is not web-compatible
// and causes "x.Map is not a constructor" when bundled for web.
// This project uses MapaOSM (Leaflet iframe) for all map rendering on web.
import React from "react";
const MapView = () => null;
MapView.Animated = () => null;
export default MapView;
export const Marker = () => null;
export const Polyline = () => null;
export const Polygon = () => null;
export const Circle = () => null;
export const Callout = () => null;
export const AnimatedRegion = class {};
export const PROVIDER_GOOGLE = "google";
export const PROVIDER_DEFAULT = null;
