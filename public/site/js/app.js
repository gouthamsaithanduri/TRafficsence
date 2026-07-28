/* ==========================================================
   TrafficSense AI — Shared app data & helpers (mock)
   ========================================================== */

const TSAI = {
  // Persistent app data in localStorage
  STORAGE: {
    ROADS: "tsai_roads",
    SURVEYS: "tsai_surveys",
    SETTINGS: "tsai_settings",
  },

  getRoads() {
    let r = JSON.parse(localStorage.getItem(this.STORAGE.ROADS) || "null");
    if (!r) {
      r = [
        { id: 1, project: "Downtown Corridor Study", road: "Main Street", type: "Urban Arterial", lanes: 4, laneWidth: 3.5, width: 14, speed: 50, lat: 12.9716, lng: 77.5946 },
        { id: 2, project: "Ring Road Widening", road: "Outer Ring Rd", type: "Highway", lanes: 6, laneWidth: 3.65, width: 21.9, speed: 80, lat: 12.9352, lng: 77.6245 },
        { id: 3, project: "MG Rd Congestion Review", road: "MG Road", type: "Urban Arterial", lanes: 4, laneWidth: 3.3, width: 13.2, speed: 40, lat: 12.9760, lng: 77.6033 },
      ];
      localStorage.setItem(this.STORAGE.ROADS, JSON.stringify(r));
    }
    return r;
  },
  saveRoads(r) { localStorage.setItem(this.STORAGE.ROADS, JSON.stringify(r)); },

  getSurveys() {
    let s = JSON.parse(localStorage.getItem(this.STORAGE.SURVEYS) || "null");
    if (!s) {
      s = [
        { id: 1, roadId: 1, date: "2026-06-12", period: "Morning",  cars: 820, motorcycles: 540, buses: 32, trucks: 60, rickshaws: 120, bicycles: 45 },
        { id: 2, roadId: 1, date: "2026-06-12", period: "Evening",  cars: 1140, motorcycles: 720, buses: 44, trucks: 55, rickshaws: 160, bicycles: 22 },
        { id: 3, roadId: 2, date: "2026-06-13", period: "Afternoon",cars: 640, motorcycles: 210, buses: 18, trucks: 190, rickshaws: 30, bicycles: 5 },
      ];
      localStorage.setItem(this.STORAGE.SURVEYS, JSON.stringify(s));
    }
    return s;
  },
  saveSurveys(s) { localStorage.setItem(this.STORAGE.SURVEYS, JSON.stringify(s)); },

  // Deterministic pseudo-random hourly volume curve (bimodal AM/PM peaks)
  hourlyCurve(base = 2000, seed = 1) {
    const arr = [];
    for (let h = 0; h < 24; h++) {
      const am = Math.exp(-Math.pow((h - 9) / 1.8, 2));
      const pm = Math.exp(-Math.pow((h - 18) / 2.0, 2));
      const noise = 0.85 + ((Math.sin(seed * h) + 1) / 2) * 0.3;
      arr.push(Math.round(base * (0.3 + 1.4 * am + 1.7 * pm) * noise));
    }
    return arr;
  },

  // Capacity per lane per hour (PCU/hr) — simplified defaults
  capacityPerLane(type) {
    switch ((type || "").toLowerCase()) {
      case "highway": return 2200;
      case "expressway": return 2400;
      case "urban arterial": return 1800;
      case "collector": return 1400;
      case "local": return 900;
      default: return 1700;
    }
  },

  pcuFactor: { cars: 1, motorcycles: 0.5, buses: 3, trucks: 3, rickshaws: 1.2, bicycles: 0.4 },

  surveyPCU(s) {
    const p = this.pcuFactor;
    return Math.round(s.cars * p.cars + s.motorcycles * p.motorcycles
      + s.buses * p.buses + s.trucks * p.trucks
      + s.rickshaws * p.rickshaws + s.bicycles * p.bicycles);
  },

  losFromVC(vc) {
    if (vc <= 0.35) return "A";
    if (vc <= 0.55) return "B";
    if (vc <= 0.75) return "C";
    if (vc <= 0.90) return "D";
    if (vc <= 1.00) return "E";
    return "F";
  },

  congestionPill(vc) {
    if (vc <= 0.55) return `<span class="pill pill-ok">● Free flow</span>`;
    if (vc <= 0.80) return `<span class="pill pill-warn">● Moderate</span>`;
    if (vc <= 1.00) return `<span class="pill pill-heavy">● Heavy</span>`;
    return `<span class="pill pill-bad">● Severe</span>`;
  }
};

// Chart.js global theming
function applyChartTheme() {
  if (typeof Chart === "undefined") return;
  const dark = document.documentElement.getAttribute("data-theme") === "dark";
  Chart.defaults.color = dark ? "#cbd5e1" : "#475569";
  Chart.defaults.borderColor = dark ? "rgba(255,255,255,.08)" : "rgba(15,23,42,.08)";
  Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
}
