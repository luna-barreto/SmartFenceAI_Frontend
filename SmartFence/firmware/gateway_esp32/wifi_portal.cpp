#include "wifi_portal.h"
#include "utils.h"
#include <WiFi.h>
#include <WebServer.h>
#include <Preferences.h>

#define NVS_NS       "sfwifi"
#define NVS_KEY_SSID "ssid"
#define NVS_KEY_PASS "pass"

// ─── NVS ─────────────────────────────────────────────────────────────────────
bool wifiPortalLoad(char* ssid, size_t ssidLen, char* pass, size_t passLen) {
  Preferences p;
  p.begin(NVS_NS, true);
  String s = p.getString(NVS_KEY_SSID, "");
  String w = p.getString(NVS_KEY_PASS, "");
  p.end();
  if (s.length() == 0) return false;
  strncpy(ssid, s.c_str(), ssidLen - 1); ssid[ssidLen - 1] = '\0';
  strncpy(pass, w.c_str(), passLen - 1); pass[passLen - 1] = '\0';
  return true;
}

static void wifiPortalSave(const char* ssid, const char* pass) {
  Preferences p;
  p.begin(NVS_NS, false);
  p.putString(NVS_KEY_SSID, ssid);
  p.putString(NVS_KEY_PASS, pass);
  p.end();
}

// ─── HTML ─────────────────────────────────────────────────────────────────────
static const char PAGE[] PROGMEM = R"HTML(<!DOCTYPE html><html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>SmartFence WiFi</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,sans-serif;background:#0f172a;color:#f1f5f9;
     min-height:100vh;display:flex;align-items:center;justify-content:center;padding:16px}
.c{background:#1e293b;border-radius:20px;padding:28px 22px;width:100%;max-width:380px}
h1{color:#4ade80;font-size:1.25rem;font-weight:800;margin-bottom:6px}
p{color:#94a3b8;font-size:.85rem;margin-bottom:20px}
label{display:block;font-size:.75rem;font-weight:700;color:#94a3b8;margin:14px 0 4px}
input{width:100%;padding:11px 13px;border-radius:11px;border:1.5px solid #334155;
      background:#0f172a;color:#f1f5f9;font-size:.95rem;outline:none}
input:focus{border-color:#4ade80}
button{margin-top:22px;width:100%;padding:13px;border-radius:13px;border:none;
       background:#16a34a;color:#fff;font-size:1rem;font-weight:800;cursor:pointer}
</style></head>
<body><div class="c">
<h1>SmartFence Gateway</h1>
<p>Ingresa los datos de tu red WiFi.</p>
<form method="POST" action="/save">
  <label>Red WiFi (SSID)</label>
  <input name="ssid" type="text" maxlength="31" required autocomplete="off" placeholder="Nombre de la red">
  <label>Contrasena</label>
  <input name="pass" type="password" maxlength="63" autocomplete="off" placeholder="Dejar vacio si es abierta">
  <button type="submit">Guardar y conectar</button>
</form>
</div></body></html>)HTML";

static const char PAGE_OK[] PROGMEM = R"HTML(<!DOCTYPE html><html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>SmartFence</title>
<style>
body{font-family:system-ui,sans-serif;background:#0f172a;color:#f1f5f9;
     min-height:100vh;display:flex;align-items:center;justify-content:center;padding:16px}
.c{background:#1e293b;border-radius:20px;padding:28px 22px;width:100%;max-width:380px;text-align:center}
h1{color:#4ade80;font-size:1.25rem;font-weight:800;margin-bottom:10px}
p{color:#94a3b8;font-size:.9rem}
</style></head>
<body><div class="c">
<h1>&#10003; Guardado</h1>
<p>El gateway va a reiniciarse y conectarse a tu red.<br>Puedes cerrar esta pagina.</p>
</div></body></html>)HTML";

// ─── Portal ───────────────────────────────────────────────────────────────────
void wifiPortalRun() {
  // Limpiar modo anterior antes de levantar AP
  WiFi.disconnect(true);
  delay(100);
  WiFi.mode(WIFI_AP);
  WiFi.softAP("SmartFence-Setup");   // sin contraseña — fácil conectar
  debugPrintf("[PORTAL] AP activo — conectate a 'SmartFence-Setup' y abre http://%s\n",
              WiFi.softAPIP().toString().c_str());

  WebServer server(80);

  // Cualquier ruta muestra el formulario
  server.onNotFound([&]() {
    server.send_P(200, "text/html", PAGE);
  });
  server.on("/", HTTP_GET, [&]() {
    server.send_P(200, "text/html", PAGE);
  });

  server.on("/save", HTTP_POST, [&]() {
    String ssid = server.arg("ssid");
    String pass = server.arg("pass");
    ssid.trim();
    if (ssid.length() == 0) {
      server.send(400, "text/plain", "SSID requerido");
      return;
    }
    server.send_P(200, "text/html", PAGE_OK);
    wifiPortalSave(ssid.c_str(), pass.c_str());
    debugPrintf("[PORTAL] Guardado SSID='%s' — reiniciando\n", ssid.c_str());
    delay(800);
    ESP.restart();
  });

  server.begin();
  while (true) {
    server.handleClient();
    delay(2);
  }
}
