const map = L.map("map").setView([52.15, 5.39], 12);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const infoBox = document.getElementById("infoBox");
const closeBtn = document.getElementById("closeBtn");

// Sluit knop event
closeBtn.addEventListener("click", () => {
  infoBox.classList.remove("visible");
});

// Functie om infoBox te tonen met tekst
function showInfoBox(title, content) {
  infoBox.innerHTML = `
    <span class="close-btn" id="closeBtn">&times;</span>
    <div class="info-header">${title}</div>
    <div class="info-body">${content}</div>
  `;
  infoBox.classList.add("visible");

  // Herbind close event (want we vervangen innerHTML)
  document.getElementById("closeBtn").addEventListener("click", () => {
    infoBox.classList.remove("visible");
  });
}

// GPX route inladen
const gpx = new L.GPX("route.gpx", {
  async: true,
  marker_options: {
    startIconUrl: null,
    endIconUrl: null,
    shadowUrl: null,
  },
})
  .on("loaded", function (e) {
    map.fitBounds(e.target.getBounds());

    function findPolyline(layerGroup) {
      let polyline = null;
      layerGroup.eachLayer((layer) => {
        if (layer instanceof L.Polyline) {
          polyline = layer;
        } else if (layer.getLayers) {
          polyline = findPolyline(layer);
        }
      });
      return polyline;
    }

    const routeLine = findPolyline(e.target);
    console.log("Gevonden polyline:", routeLine);
    if (!routeLine) return;
  })
  .addTo(map);

// Waypoints toevoegen uit GPX
fetch("route.gpx")
  .then((res) => res.text())
  .then((gpxText) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(gpxText, "text/xml");
    const wpts = xmlDoc.getElementsByTagName("wpt");

    for (let i = 0; i < wpts.length; i++) {
      const wpt = wpts[i];
      const lat = parseFloat(wpt.getAttribute("lat"));
      const lon = parseFloat(wpt.getAttribute("lon"));
      const name =
        wpt.getElementsByTagName("name")[0]?.textContent || "Waypoint";
      const desc = wpt.getElementsByTagName("desc")[0]?.textContent || "";

      const marker = L.marker([lat, lon], { icon: redIcon }).addTo(map);
      marker.on("click", () => {
        showInfoBox(name, desc);
        map.setView([lat, lon], 15, { animate: true });
      });
    }
  });
