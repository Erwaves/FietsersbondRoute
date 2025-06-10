const map = L.map("map").setView([52.15, 5.39], 12);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const infoBox = document.getElementById("infoBox");

// Route tekenen zonder markers
const gpxRoute = new L.GPX("route.gpx", {
  async: true,
  marker_options: {
    startIconUrl: null,
    endIconUrl: null,
    shadowUrl: null,
  },
})
  .on("loaded", function (e) {
    map.fitBounds(e.target.getBounds());
  })
  .addTo(map);

// Waypoints handmatig parsen en custom markers toevoegen
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
      marker.bindPopup(`<strong>${name}</strong><br>${desc}`);
      marker.on("click", () => {
        infoBox.innerHTML = `<strong>${name}</strong><br>${desc}`;
      });
    }
  });
