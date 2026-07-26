import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

import { authRouter }      from "./routes/auth.js";
import { animalesRouter }  from "./routes/animales.js";
import { alertasRouter }   from "./routes/alertas.js";
import { collaresRouter }  from "./routes/collares.js";
import { geocercasRouter } from "./routes/geocercas.js";
import { gpsRouter }       from "./routes/gps.js";
import { pushRouter }      from "./routes/push.js";
import { adminRouter }     from "./routes/admin.js";
import { registrarSockets, procesarTelemetria } from "./sockets/index.js";
import { iniciarBridgeMQTT } from "./mqtt/bridge.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth",        authRouter);
app.use("/api/animales",    animalesRouter);
app.use("/api/alertas",     alertasRouter);
app.use("/api/collares",    collaresRouter);
app.use("/api/geocercas",   geocercasRouter);
app.use("/api/gps",         gpsRouter);
app.use("/api/tokens-push", pushRouter);
app.use("/api/admin",       adminRouter);

app.get("/api/salud", (_req, res) =>
  res.json({ estado: "ok", servicio: "smartfence-backend", version: "2.0.0" })
);

const servidorHttp = createServer(app);
const io = new Server(servidorHttp, { cors: { origin: "*" } });
registrarSockets(io);

// Bridge MQTT: recibe telemetría del gateway LoRa desde HiveMQ Cloud
iniciarBridgeMQTT(io, procesarTelemetria);

const PUERTO = process.env.PORT || 4000;
servidorHttp.listen(PUERTO, () => {
  console.log(`SmartFence backend v2 escuchando en http://localhost:${PUERTO}`);
  console.log("Rutas: /api/auth | /api/animales | /api/collares | /api/geocercas | /api/alertas | /api/gps | /api/tokens-push | /api/admin");
  console.log("MQTT Bridge: conectando a HiveMQ Cloud...");
});
