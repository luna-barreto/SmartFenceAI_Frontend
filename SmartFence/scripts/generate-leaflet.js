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

    const mapa = L.map('mapa', { zoomControl: false, attributionControl: false }).setView([4.5709, -74.2973], 14);

    const capaOSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 });
    const capaSatelite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 20 });
    capaOSM.addTo(mapa);

    let esSatelite = false;
    document.getElementById('btn-capa').addEventListener('click', function() {
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
        const n = cercaCoords.length;
        const cx = cercaCoords.reduce((s, p) => s + p[0], 0) / n;
        const cy = cercaCoords.reduce((s, p) => s + p[1], 0) / n;
        fueraAnimales.forEach(a => {
          brechasLayers.push(
            L.polyline([[cx, cy], [a.ubicacion.lat, a.ubicacion.lng]], {
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
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ tipo: 'cerca_actualizada', puntos: cercaCoords }));
        });
        verticeMarkers.push(m);
      });
    }

    function colorMarker(a) {
      if (!a.collar || a.collar.estado === 'fuera_de_rango' || a.collar.estado === 'sin_ñal') return '#6B7280';
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
      return '<div style="min-width:160px"><b style="font-size:13px">' + a.nombre + '</b><br>'
        + '<span style="color:#94A3B8;font-size:11px">' + serial + '</span><br>'
        + '<span style="margin-top:4px;display:inline-block">' + estado + '</span><br>'
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
            window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ tipo: 'animal_click', id: a.id }));
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
    window.actualizarCerca = (coords) => { cercaCoords = coords; dibujarCerca(); dibujarVertices(); };
    window.setEditando = (val) => { modoEdicion = val; dibujarCerca(); dibujarVertices(); };
    window.actualizarAnimales = pintarAnimales;

    // Notificar a React Native que el mapa está listo
    window.addEventListener('load', function() {
      window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ tipo: 'listo' }));
    });
    // También notificar inline (por si load ya disparó)
    window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ tipo: 'listo' }));
  </script>
</body>
</html>`;

const outPath = path.join(__dirname, '../assets/mapa.html');
fs.writeFileSync(outPath, html, 'utf8');
console.log('Generated', outPath, '-', Math.round(html.length / 1024), 'KB');
