const fs = require('fs');
const path = require('path');

const leafletJS = fs.readFileSync(
  path.join(__dirname, '../node_modules/leaflet/dist/leaflet.js'),
  'utf8'
).replace(/\/\/# sourceMappingURL=.*/g, '');

const leafletCSS = fs.readFileSync(
  path.join(__dirname, '../node_modules/leaflet/dist/leaflet.css'),
  'utf8'
);

const COW_PATH = "M6.27 12.52c0 .22-.18.4-.4.4H4.81c-.31 0-.5-.33-.35-.6.07-.12.2-.2.35-.2h1.06c.22 0 .4.18.4.4zm4.92-.4h-1.06c-.31 0-.5.33-.35.6.07.12.2.2.35.2h1.06c.31 0 .5-.33.35-.6-.07-.12-.2-.2-.35-.2zM6.22 7.73c-.51 0-.83.55-.58 1 .26.44.9.44 1.15 0 .06-.1.09-.22.09-.33 0-.37-.3-.67-.66-.67zm3.72 0c-.51 0-.83.55-.58 1 .26.44.9.44 1.15 0 .06-.1.09-.22.09-.33 0-.37-.3-.67-.66-.67zM15.64 8.18c-.18.22-.44.34-.72.34H12.65v2.33c1.58 1.13 1.35 3.55-.42 4.35-.33.15-.68.23-1.04.23H4.81c-1.94 0-3.16-2.11-2.18-3.79.18-.31.43-.58.72-.79V8.52H1.09c-.28 0-.55-.13-.72-.34-.18-.21-.25-.49-.19-.76.34-1.67 1.81-2.88 3.52-2.88h.46C3.28 3.84 2.79 2.81 2.79 1.73c0-.31.33-.5.6-.35.12.07.2.2.2.35 0 1.54 1.25 2.79 2.79 2.79h3.19c1.54 0 2.79-1.25 2.79-2.79 0-.31.33-.5.6-.35.12.07.2.2.2.35 0 1.08-.49 2.11-1.34 2.79h.46c1.71 0 3.18 1.21 3.52 2.88.05.27-.02.55-.19.76zm-12.28-.46v-.66c0-.64.25-1.26.69-1.73H3.7c-1.33 0-2.47.94-2.74 2.24-.01.04 0 .07.03.1.03.03.07.05.11.05H3.36zm9.57 5.18c0-.95-.77-1.73-1.73-1.73H4.81c-1.33 0-2.16 1.44-1.5 2.59.31.53.88.86 1.5.86h6.38c.95 0 1.73-.77 1.73-1.73zm-1.06-2.44V7.07c0-.95-.77-1.73-1.73-1.73H5.87c-.95 0-1.73.77-1.73 1.73v3.41c.22-.06.44-.09.66-.09h6.38c.22 0 .45.03.66.09zm3.19-2.9c-.26-1.3-1.41-2.24-2.74-2.24h-.34c.44.47.69 1.09.69 1.73v.66h2.26c.04 0 .08-.02.1-.05.02-.03.03-.07.03-.1z";

const html = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
  <style>
${leafletCSS}
    html, body, #mapa { height: 100%; margin: 0; padding: 0; background: #284a25; }
    .leaflet-control-zoom { display: none !important; }
    .cow-marker {
      display: flex; align-items: center; justify-content: center;
      width: 36px; height: 36px; border-radius: 50%;
      border: 2.5px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,.4);
      cursor: pointer; transition: transform .15s;
    }
    .cow-marker:hover { transform: scale(1.15); }
    .edit-vertex {
      width: 14px; height: 14px; border-radius: 50%;
      background: white; border: 2.5px solid #2E7D32;
      cursor: grab; box-shadow: 0 2px 6px rgba(0,0,0,.3);
    }
    .leaflet-tooltip {
      background: rgba(15,23,42,.88); color: #f1f5f9;
      border: none; border-radius: 10px; padding: 7px 11px;
      font-size: 12px; font-family: system-ui, sans-serif;
      box-shadow: 0 4px 14px rgba(0,0,0,.4); white-space: nowrap;
    }
    .leaflet-tooltip-top::before { border-top-color: rgba(15,23,42,.88); }
    .bat-bar { width:64px; height:5px; background:#334155; border-radius:3px; margin-top:4px; overflow:hidden; }
    .bat-fill { height:100%; border-radius:3px; }
    #btn-capa {
      position: absolute; top: 12px; right: 12px; z-index: 1000;
      background: rgba(255,255,255,0.95); border: none; border-radius: 10px;
      padding: 7px 13px; font-size: 12px; font-weight: 700;
      font-family: system-ui, sans-serif; color: #1F2937; cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,.22); letter-spacing: 0.2px;
    }
    #btn-capa:active { transform: scale(0.96); }
  </style>
</head>
<body>
  <div id="mapa"></div>
  <button id="btn-capa">&#x1F6F0; Sat&#xe9;lite</button>
  <script>
${leafletJS}
  </script>
  <script>
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({ iconUrl: '', shadowUrl: '', iconRetinaUrl: '' });

    const mapa = L.map('mapa', { zoomControl: false, attributionControl: false }).setView([10.8997, -74.8983], 14);

    const capaOSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 });
    const capaSatelite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 20 });
    // Satellite is the default layer
    capaSatelite.addTo(mapa);

    let esSatelite = true;
    var btnCapa = document.getElementById('btn-capa');
    btnCapa.textContent = '🗺 Mapa';
    btnCapa.addEventListener('click', function() {
      if (esSatelite) {
        mapa.removeLayer(capaSatelite); capaOSM.addTo(mapa);
        this.textContent = '🛰 Satélite'; esSatelite = false;
      } else {
        mapa.removeLayer(capaOSM); capaSatelite.addTo(mapa);
        this.textContent = '🗺 Mapa'; esSatelite = true;
      }
    });

    let cercaCoords = [];
    let animalesData = [];
    let modoEdicion = false;
    let poligonoLayer = null;
    let brechasLayers = [];

    function dibujarCerca() {
      if (poligonoLayer) mapa.removeLayer(poligonoLayer);
      brechasLayers.forEach(l => mapa.removeLayer(l));
      brechasLayers = [];
      if (!cercaCoords.length) return;
      poligonoLayer = L.polygon(cercaCoords, {
        color: '#76C043', weight: 2.5,
        fillColor: '#9CD15B', fillOpacity: 0.18,
        dashArray: modoEdicion ? '8 4' : null,
      }).addTo(mapa);
      const fueraAnimales = animalesData.filter(a => !a.dentroDeCerca && a.ubicacion);
      if (fueraAnimales.length > 0) {
        fueraAnimales.forEach(a => {
          // Línea desde el vértice más cercano de la cerca hasta el animal
          var minDist = Infinity, nearPt = cercaCoords[0];
          cercaCoords.forEach(function(p) {
            var d = Math.pow(p[0]-a.ubicacion.lat,2)+Math.pow(p[1]-a.ubicacion.lng,2);
            if(d < minDist){ minDist=d; nearPt=p; }
          });
          brechasLayers.push(
            L.polyline([nearPt, [a.ubicacion.lat, a.ubicacion.lng]], {
              color: '#EF4444', weight: 2, dashArray: '6 4', opacity: 0.7,
            }).addTo(mapa)
          );
        });
      }
    }

    let verticeMarkers = [];
    function dibujarVertices() {
      verticeMarkers.forEach(m => mapa.removeLayer(m));
      verticeMarkers = [];
      if (!modoEdicion) return;
      cercaCoords.forEach((pt, i) => {
        const icono = L.divIcon({ className: '', html: '<div class="edit-vertex"></div>', iconSize: [14, 14], iconAnchor: [7, 7] });
        const m = L.marker(pt, { icon: icono, draggable: true }).addTo(mapa);
        m.on('drag', (e) => { const ll = e.target.getLatLng(); cercaCoords[i] = [ll.lat, ll.lng]; dibujarCerca(); });
        m.on('dragend', () => {
          const _msg = JSON.stringify({ tipo: 'cerca_actualizada', puntos: cercaCoords });
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage(_msg);
          window.parent !== window && window.parent.postMessage(_msg, '*');
        });
        verticeMarkers.push(m);
      });
    }

    function colorMarker(a) {
      if (!a.collar || a.collar.estado === 'fuera_de_rango' || a.collar.estado === 'sin_señal') return '#6B7280';
      const bat = a.collar.bateriaPorcentaje != null ? a.collar.bateriaPorcentaje : (a.collar.bateria != null ? a.collar.bateria : 100);
      if (bat <= 20) return '#F59E0B';
      return a.dentroDeCerca ? '#43A047' : '#EF4444';
    }

    function makeTooltip(a) {
      const bat = a.collar ? (a.collar.bateriaPorcentaje != null ? a.collar.bateriaPorcentaje : (a.collar.bateria != null ? a.collar.bateria : '?')) : '?';
      const estado = a.dentroDeCerca ? '🟢 Dentro' : '🔴 Fuera';
      const serial = a.collar ? (a.collar.serial || a.collar.id || '') : '';
      const batColor = bat <= 20 ? '#EF4444' : bat <= 50 ? '#F59E0B' : '#43A047';
      const lat = a.ubicacion ? a.ubicacion.lat.toFixed(6) : '—';
      const lng = a.ubicacion ? a.ubicacion.lng.toFixed(6) : '—';
      // Sensor de calor (optional — present when coming from demo data)
      const saludHtml = (a.saludLabel && a.saludR != null)
        ? '<div style="display:flex;align-items:center;gap:5px;margin-top:5px">'
          + '<div style="width:9px;height:9px;border-radius:50%;background:rgb(' + a.saludR + ',' + a.saludG + ',' + a.saludB + ');flex-shrink:0"></div>'
          + '<span style="font-size:11px;color:#94A3B8">Sensor calor:</span>'
          + '<span style="font-size:11px;font-weight:700;color:rgb(' + a.saludR + ',' + a.saludG + ',' + a.saludB + ')">' + a.saludLabel + '</span>'
          + '</div>'
        : '';
      // Collar cortado warning
      const collarCortadoHtml = (a.collar && (a.collar.estado === 'fuera_de_rango'))
        ? '<div style="margin-top:4px;font-size:11px;color:#EF4444;font-weight:700">⚠ Collar sin señal</div>'
        : '';
      return '<div style="min-width:160px"><b style="font-size:13px">' + a.nombre + '</b><br>'
        + '<span style="color:#94A3B8;font-size:11px">' + serial + '</span><br>'
        + '<span style="margin-top:4px;display:inline-block">' + estado + '</span>'
        + collarCortadoHtml
        + saludHtml
        + '<div style="margin-top:4px;font-size:11px;color:#94A3B8">📍 ' + lat + ', ' + lng + '</div>'
        + '<div style="display:flex;align-items:center;gap:6px;margin-top:4px">'
        + '<span style="font-size:11px;color:#94A3B8">Batería</span>'
        + '<div class="bat-bar"><div class="bat-fill" style="width:' + bat + '%;background:' + batColor + '"></div></div>'
        + '<span style="font-size:11px;color:' + batColor + '">' + bat + '%</span>'
        + '</div></div>';
    }

    const COW_PATH_DATA = "${COW_PATH}";
    function makeCowHtml(color) {
      return '<div class="cow-marker" style="background:' + color + '">'
        + '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16">'
        + '<path d="' + COW_PATH_DATA + '" fill="white"/></svg></div>';
    }

    let marcadores = {};
    function pintarAnimales(lista) {
      animalesData = lista;
      const idsActuales = new Set(lista.map(a => a.id));
      Object.keys(marcadores).forEach(id => {
        if (!idsActuales.has(id)) { mapa.removeLayer(marcadores[id]); delete marcadores[id]; }
      });
      lista.forEach(a => {
        if (!a.ubicacion) return;
        const color = colorMarker(a);
        if (marcadores[a.id]) {
          marcadores[a.id].setLatLng([a.ubicacion.lat, a.ubicacion.lng]);
          marcadores[a.id].setIcon(L.divIcon({ className: '', html: makeCowHtml(color), iconSize: [36, 36], iconAnchor: [18, 18] }));
          marcadores[a.id].setTooltipContent(makeTooltip(a));
        } else {
          const icono = L.divIcon({ className: '', html: makeCowHtml(color), iconSize: [36, 36], iconAnchor: [18, 18] });
          const m = L.marker([a.ubicacion.lat, a.ubicacion.lng], { icon: icono }).addTo(mapa);
          m.bindTooltip(makeTooltip(a), { direction: 'top', offset: [0, -20] });
          m.on('click', () => {
            const _msg = JSON.stringify({ tipo: 'animal_click', id: a.id });
            window.ReactNativeWebView && window.ReactNativeWebView.postMessage(_msg);
            window.parent !== window && window.parent.postMessage(_msg, '*');
          });
          marcadores[a.id] = m;
        }
      });
      dibujarCerca();
    }

    let historialLayer = null;
    window.mostrarHistorial = function(puntos) {
      if (historialLayer) { mapa.removeLayer(historialLayer); historialLayer = null; }
      if (!puntos || puntos.length < 2) return;
      const coords = puntos.map(p => [p.lat, p.lng]);
      historialLayer = L.layerGroup([
        L.polyline(coords, { color: '#60A5FA', weight: 3, opacity: 0.85, dashArray: '6 3' }),
        L.circleMarker(coords[0], { radius: 6, color: '#2563EB', fillColor: '#93C5FD', fillOpacity: 1, weight: 2 }),
        L.circleMarker(coords[coords.length - 1], { radius: 6, color: '#2563EB', fillColor: '#1D4ED8', fillOpacity: 1, weight: 2 }),
      ]).addTo(mapa);
      mapa.fitBounds(L.polyline(coords).getBounds(), { padding: [40, 40] });
    };
    window.limpiarHistorial = function() {
      if (historialLayer) { mapa.removeLayer(historialLayer); historialLayer = null; }
    };

    const userLocIcon = L.divIcon({
      className: '',
      html: '<div style="width:16px;height:16px;border-radius:50%;background:#3B82F6;border:3px solid white;box-shadow:0 0 0 4px rgba(59,130,246,.25)"></div>',
      iconSize: [16, 16], iconAnchor: [8, 8],
    });
    let userMarker = null;
    let userLat = null, userLng = null;
    window.actualizarUbicacionUsuario = function(lat, lng) {
      if (!lat || !lng) return;
      userLat = lat; userLng = lng;
      if (userMarker) { userMarker.setLatLng([lat, lng]); }
      else { userMarker = L.marker([lat, lng], { icon: userLocIcon }).addTo(mapa); }
    };

    window.zoomIn = () => mapa.zoomIn();
    window.zoomOut = () => mapa.zoomOut();
    window.moverVista = (lat, lng, z) => mapa.setView([lat, lng], z || mapa.getZoom());
    window.centerarEnUsuario = function() {
      if (userLat && userLng) mapa.setView([userLat, userLng], mapa.getZoom());
    };
    window.actualizarCerca = (coords, fitView) => {
      cercaCoords = coords; dibujarCerca(); dibujarVertices();
      if (fitView && coords.length > 1) {
        try { mapa.fitBounds(L.polygon(coords).getBounds(), { padding: [40, 40] }); } catch(e) {}
      }
    };
    window.setEditando = (val) => { modoEdicion = val; dibujarCerca(); dibujarVertices(); };
    window.actualizarAnimales = pintarAnimales;

    // Recibir comandos desde React (iframe web) o desde React Native (WebView)
    window.addEventListener('message', function(e) {
      try {
        const cmd = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (!cmd || !cmd.tipo) return;
        if (cmd.tipo === 'moverVista') window.moverVista && window.moverVista(cmd.lat, cmd.lng, cmd.zoom);
        else if (cmd.tipo === 'actualizarCerca') window.actualizarCerca && window.actualizarCerca(cmd.coords, cmd.fitView);
        else if (cmd.tipo === 'actualizarAnimales') window.actualizarAnimales && window.actualizarAnimales(cmd.animales);
        else if (cmd.tipo === 'setEditando') window.setEditando && window.setEditando(cmd.valor);
        else if (cmd.tipo === 'actualizarUbicacionUsuario') window.actualizarUbicacionUsuario && window.actualizarUbicacionUsuario(cmd.lat, cmd.lng);
        else if (cmd.tipo === 'mostrarHistorial') window.mostrarHistorial && window.mostrarHistorial(cmd.puntos);
        else if (cmd.tipo === 'limpiarHistorial') window.limpiarHistorial && window.limpiarHistorial();
      } catch (err) { /* ignorar mensajes mal formados */ }
    });

    // ── Demo animation ─────────────────────────────────────────────────────────
    // Only active when data ids start with "d-" (demo dataset).
    // Normal animals: gentle Brownian walk anchored to their OWN initial position
    //   so they spread out naturally and don't cluster at center.
    // d-12 (Luna) and d-14 (Reina): follow a fixed arc that crosses the fence
    //   boundary so dentroDeCerca flips and the breach line appears/disappears.

    var demoAnim = null;
    var posIniciales = {}; // id → {lat, lng} anchor for Brownian walk

    // Ray-casting point-in-polygon (poly = [[lat,lng], ...])
    function puntoDentroDePoligono(lat, lng, poly) {
      var inside = false;
      for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        var xi = poly[i][0], yi = poly[i][1];
        var xj = poly[j][0], yj = poly[j][1];
        if (((yi > lng) !== (yj > lng)) && (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi)) {
          inside = !inside;
        }
      }
      return inside;
    }

    // Hardcoded escaper routes so breach lines are always short and visible
    // inLat/inLng  = position INSIDE the fence (near the edge)
    // outLat/outLng = position just OUTSIDE the fence (~200-300 m past the edge)
    // phase 0→1: moving out; phase 1→2: moving back in; wraps at 2
    var ESCAPER_ROUTES = {
      'd-12': { inLat: 10.8728, inLng: -74.9065, outLat: 10.8701, outLng: -74.9053, phase: 0,   speed: 0.05 },
      'd-14': { inLat: 10.8774, inLng: -74.9107, outLat: 10.8802, outLng: -74.9135, phase: 0.3, speed: 0.04 },
    };

    function lerp(a, b, t) { return a + (b - a) * t; }
    function easeIO(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2; }

    function tickDemo() {
      if (!animalesData.length || !animalesData[0] || !String(animalesData[0].id).startsWith('d-')) return;
      if (!cercaCoords.length) return;

      var updated = animalesData.map(function(a) {
        var copy = Object.assign({}, a, { ubicacion: Object.assign({}, a.ubicacion) });

        if (ESCAPER_ROUTES[copy.id]) {
          // Escaper: follow fixed arc in→out→in
          var e = ESCAPER_ROUTES[copy.id];
          e.phase = (e.phase + e.speed) % 2;
          var t = e.phase <= 1 ? e.phase : 2 - e.phase; // triangle 0→1→0
          var ease = easeIO(t);
          copy.ubicacion.lat = lerp(e.inLat, e.outLat, ease);
          copy.ubicacion.lng = lerp(e.inLng, e.outLng, ease);
        } else {
          // Normal animal: Brownian walk anchored to its own initial position
          if (!posIniciales[copy.id]) {
            posIniciales[copy.id] = { lat: copy.ubicacion.lat, lng: copy.ubicacion.lng };
          }
          var home = posIniciales[copy.id];
          var s = 0.000028;
          copy.ubicacion.lat += (Math.random() - 0.5) * s * 2;
          copy.ubicacion.lng += (Math.random() - 0.5) * s * 2;
          // Pull back toward own home if too far (~120 m radius)
          var dlat = copy.ubicacion.lat - home.lat;
          var dlng = copy.ubicacion.lng - home.lng;
          var dist = Math.sqrt(dlat * dlat + dlng * dlng);
          if (dist > 0.0011) {
            copy.ubicacion.lat -= dlat * 0.22;
            copy.ubicacion.lng -= dlng * 0.22;
          }
        }

        copy.dentroDeCerca = cercaCoords.length > 2
          ? puntoDentroDePoligono(copy.ubicacion.lat, copy.ubicacion.lng, cercaCoords)
          : true;
        return copy;
      });

      // Call original directly to avoid re-triggering the wrapper
      _pintarOriginal(updated);
    }

    function iniciarAnimDemo() {
      if (demoAnim) return;
      tickDemo(); // immediate first tick — corrects far-outside initial positions
      demoAnim = setInterval(tickDemo, 1200);
    }

    function detenerAnimDemo() {
      if (demoAnim) { clearInterval(demoAnim); demoAnim = null; }
    }

    var _pintarOriginal = pintarAnimales;
    var demoBaseData = null; // datos originales del demo (sin posiciones animadas)
    pintarAnimales = function(lista) {
      var esDemo = lista.length > 0 && lista[0] && String(lista[0].id).startsWith('d-');
      if (esDemo) {
        // Guardar los datos base (collar, bateria, salud, etc.) pero conservar
        // las posiciones que ya tiene animalesData si la animación está corriendo.
        if (demoAnim && animalesData.length === lista.length) {
          // Merge: actualizar campos no-posición (salud, batería) pero mantener lat/lng animadas
          lista.forEach(function(a, i) {
            var curr = animalesData[i];
            if (curr && curr.id === a.id) {
              animalesData[i] = Object.assign({}, a, {
                ubicacion: curr.ubicacion,
                dentroDeCerca: curr.dentroDeCerca,
              });
            }
          });
          dibujarCerca();
          return;
        }
        // Primera vez: pintar con posiciones base y arrancar animación
        demoBaseData = lista;
        _pintarOriginal(lista);
        iniciarAnimDemo();
      } else {
        detenerAnimDemo();
        demoBaseData = null;
        posIniciales = {};
        _pintarOriginal(lista);
      }
    };
    window.actualizarAnimales = pintarAnimales;
    // ── End demo animation ─────────────────────────────────────────────────────

    // Notificar a React Native / parent que el mapa está listo
    function _notificarListo() {
      const _msg = JSON.stringify({ tipo: 'listo' });
      window.ReactNativeWebView && window.ReactNativeWebView.postMessage(_msg);
      window.parent !== window && window.parent.postMessage(_msg, '*');
    }
    window.addEventListener('load', _notificarListo);
    // También notificar inline (por si load ya disparó)
    _notificarListo();
  </script>
</body>
</html>`;

const outPath = path.join(__dirname, '../assets/mapa.html');
fs.writeFileSync(outPath, html, 'utf8');
console.log('Generated', outPath, '-', Math.round(html.length / 1024), 'KB');
