# SmartFence AI — App móvil (Expo + React Native)

Ecosistema de monitoreo de ganado con collares inteligentes, cercas virtuales
y alertas en tiempo real. Proyecto del programa **Tecnólogo en Análisis y
Desarrollo de Software (ADSO 23) — SENA, Regional Atlántico**.

## Stack

| Capa | Tecnología |
|---|---|
| App móvil | Expo SDK 54 · React Native · TypeScript |
| Navegación | React Navigation (Stack + Bottom Tabs) |
| Estilos | NativeWind (Tailwind CSS para RN) |
| Mapas | OpenStreetMap (Leaflet embebido vía WebView) |
| Datos remotos | Axios (REST) + Socket.io (tiempo real) |
| Backend (listo para conectar) | Node.js + Express + PostgreSQL/PostGIS |
| Hardware objetivo | ESP32 + GPS NEO-6M + LoRa |

## Estructura

```
SmartFence/
├── app/                  # reservada (no usada — ver app/README.md)
├── assets/               # logo, splash, ilustraciones, iconos
├── backend/              # API REST + Socket.io + esquema PostgreSQL (opcional, ver abajo)
├── firmware/             # firmware de referencia del collar (ESP32 + GPS + LoRa)
├── src/
│   ├── screens/          # LoginScreen, HomeScreen, MapScreen, AnimalsScreen, AlertsScreen...
│   ├── components/       # Header, AnimalCard, CustomButton, StatCard, MapaOSM...
│   ├── navigation/       # AppNavigator, AuthNavigator, types
│   ├── services/         # api.ts (Axios), socket.ts (Socket.io)
│   ├── hooks/            # useAnimals (simulación de telemetría), useSocket
│   ├── context/          # AuthContext, ThemeContext
│   ├── styles/           # colors.ts, global.css
│   └── utils/            # geo.ts (punto en polígono, distancias), format.ts
├── App.tsx
├── package.json
├── tsconfig.json
└── app.json
```

## Cómo correr la app (frontend)

Requisitos: Node.js 18+, la app **Expo Go** en tu teléfono (o un emulador
Android/iOS), y npm.

```bash
cd SmartFence
npm install
npx expo start
```

Escanea el código QR con Expo Go (Android) o la cámara (iOS). También puedes
presionar `w` en la terminal para abrirlo en el navegador, o `a`/`i` para
emulador Android/iOS.

La app funciona **sin backend**: `LoginScreen` permite entrar en modo demo,
y `useAnimals` genera un rebaño simulado que se mueve solo, cruza la cerca
virtual y dispara alertas — así puedes probar todo el flujo (Inicio, Mapa,
Ganado, Alarmas, Dispositivos, Configuración) de inmediato.

## Cómo conectar el backend real

```bash
cd backend
cp .env.example .env      # edita DATABASE_URL y JWT_SECRET
npm install
createdb smartfence        # o crea la base en tu gestor de PostgreSQL
npm run migrate            # aplica el esquema (requiere extensión PostGIS)
npm run dev
```

Luego, en `app.json → expo.extra.apiUrl` / `socketUrl` (o variables de
entorno `EXPO_PUBLIC_API_URL` / `EXPO_PUBLIC_SOCKET_URL`), apunta la app a
tu backend, por ejemplo `http://TU_IP_LOCAL:4000`.

Cuando el backend responde, `useAnimals` deja de simular y usa los datos
reales de `GET /api/animales`; los eventos `telemetria:collar` que emita tu
gateway LoRa (ver `backend/src/sockets/index.js`) actualizan el mapa al
instante vía Socket.io.

## Conectar el hardware (ESP32 + GPS + LoRa)

`firmware/collar_esp32/collar_esp32.ino` es un punto de partida documentado:
lee el NEO-6M por UART y transmite `{ collarId, lat, lng, bateria }` por
LoRa cada 4 segundos. Un gateway (otro ESP32 o Raspberry Pi con receptor
LoRa) debe reenviar ese mismo JSON al backend emitiendo el evento de socket
`telemetria:collar` — el backend lo guarda en PostgreSQL/PostGIS y lo
retransmite a todas las apps conectadas.

## Notas de arquitectura

- **Sin Google Maps ni API keys**: el mapa usa OpenStreetMap vía Leaflet
  dentro de un WebView (`src/components/MapaOSM.tsx`), compatible con
  Android, iOS y Web.
- **Geocercas**: el cálculo "dentro/fuera" se hace con ray-casting en el
  cliente (`src/utils/geo.ts`) y, en el backend, con `ST_Contains` de
  PostGIS — mismo resultado, dos capas de verificación.
- **Modo oscuro**: preparado vía `ThemeContext`, pendiente de aplicar a
  cada pantalla (usa NativeWind `dark:` si se activa `darkMode: 'class'`
  en `tailwind.config.js`).
