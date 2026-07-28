Auth.requireAuth();
const tpl = document.getElementById("page-tpl").innerHTML;
buildShell({
  title: "Dashboard",
  subtitle: "Overall traffic status across your monitored corridors",
  active: "dashboard.html",
  content: tpl,
});

const roads = TSAI.getRoads();
const surveys = TSAI.getSurveys();
const hourly = TSAI.hourlyCurve(2000, 1.4);
const peakVal = Math.max(...hourly);
const peakHour = hourly.indexOf(peakVal);
const cur = hourly[new Date().getHours()];
const capacity = TSAI.capacityPerLane("Urban Arterial") * 4;
const util = peakVal / capacity;
const los = TSAI.losFromVC(util);

document.getElementById("kpi-roads").textContent = roads.length;
document.getElementById("kpi-surveys").textContent = surveys.length;
document.getElementById("kpi-vol").textContent = cur.toLocaleString();
document.getElementById("kpi-peak").textContent = peakVal.toLocaleString();
document.getElementById("kpi-speed").textContent = "42";
document.getElementById("kpi-util").textContent = Math.round(util * 100) + "%";
document.getElementById("kpi-los").innerHTML = `<span class="los-badge los-${los}">${los}</span>`;
document.getElementById("kpi-cong").textContent = Math.round(util * 100);

applyChartTheme();

new Chart(document.getElementById("chart-hourly"), {
  type: "line",
  data: {
    labels: [...Array(24).keys()].map(h => `${h}:00`),
    datasets: [{
      label: "Volume (veh/hr)", data: hourly,
      borderColor: "#1e63ff", backgroundColor: "rgba(30,99,255,.14)",
      fill: true, tension: .4, pointRadius: 0, borderWidth: 2.5
    }]
  },
  options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
});

new Chart(document.getElementById("chart-veh"), {
  type: "doughnut",
  data: {
    labels: ["Cars","Motorcycles","Buses","Trucks","Rickshaws","Bicycles"],
    datasets: [{
      data: [820, 540, 32, 60, 120, 45],
      backgroundColor: ["#1e63ff","#22d3ee","#10b981","#f59e0b","#f97316","#a78bfa"],
      borderWidth: 0
    }]
  },
  options: { responsive: true, maintainAspectRatio: false, cutout: "62%", plugins: { legend: { position: "bottom" } } }
});

new Chart(document.getElementById("chart-daily"), {
  type: "bar",
  data: {
    labels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
    datasets: [{ label: "Vehicles/day (k)", data: [28,32,31,35,38,42,26], backgroundColor: "#1e63ff", borderRadius: 8 }]
  },
  options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
});

new Chart(document.getElementById("chart-weekly"), {
  type: "line",
  data: {
    labels: ["W1","W2","W3","W4","W5","W6","W7","W8"],
    datasets: [
      { label: "This year", data: [210,224,232,240,248,255,262,270], borderColor: "#10b981", tension: .35, borderWidth: 2.5, fill: false },
      { label: "Last year", data: [200,208,214,220,222,228,232,238], borderColor: "#94a3b8", tension: .35, borderWidth: 2, borderDash: [6,6], fill: false }
    ]
  },
  options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } }
});

// Leaflet map
const map = L.map("mapCanvas").setView([12.9716, 77.5946], 12);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap", maxZoom: 19 }).addTo(map);
const hotspots = [
  { lat: 12.9716, lng: 77.5946, vc: 1.05, name: "Main St & 5th" },
  { lat: 12.9352, lng: 77.6245, vc: 0.65, name: "Ring Rd Jct 3" },
  { lat: 12.9760, lng: 77.6033, vc: 0.90, name: "MG Rd Central" },
  { lat: 12.9500, lng: 77.5800, vc: 0.40, name: "Park Ave" },
  { lat: 12.9900, lng: 77.6100, vc: 1.20, name: "Airport Rd" }
];
const color = vc => vc <= 0.55 ? "#10b981" : vc <= 0.8 ? "#f59e0b" : vc <= 1.0 ? "#f97316" : "#ef4444";
hotspots.forEach(h => {
  L.circleMarker([h.lat, h.lng], { radius: 12, color: color(h.vc), fillColor: color(h.vc), fillOpacity: .7, weight: 2 })
    .addTo(map)
    .bindPopup(`<b>${h.name}</b><br/>V/C: ${h.vc.toFixed(2)} — ${TSAI.losFromVC(h.vc)}`);
});
