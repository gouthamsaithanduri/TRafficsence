/* ==========================================================
   TrafficSense AI — Shared App Shell
   Injects sidebar + topbar into any page with <div id="app-shell">
   ========================================================== */

const NAV = [
  { href: "dashboard.html",     ico: "📊", label: "Dashboard" },
  { href: "road-survey.html",   ico: "🛣️", label: "Road Survey" },
  { href: "traffic-survey.html",ico: "🚦", label: "Traffic Survey" },
  { href: "capacity.html",      ico: "📈", label: "Capacity Analysis" },
  { href: "peak-demand.html",   ico: "⏰", label: "Peak Demand" },
  { href: "congestion-map.html",ico: "🗺️", label: "Congestion Map" },
  { href: "ai-recommendations.html", ico: "🤖", label: "AI Recommendations" },
  { href: "reports.html",       ico: "📄", label: "Reports" },
  { href: "profile.html",       ico: "👤", label: "Profile" },
  { href: "settings.html",      ico: "⚙️", label: "Settings" },
];

function buildShell({ title, subtitle, active, content }) {
  const session = Auth.session();
  if (!session) { window.location.replace("login.html"); return; }

  const initials = (session.fullName || session.username || "U")
    .split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase();

  const navHtml = NAV.map(n => `
    <a href="${n.href}" class="${active === n.href ? "active" : ""}">
      <span class="ico">${n.ico}</span><span>${n.label}</span>
    </a>`).join("");

  const shellHtml = `
    <div class="app">
      <aside class="sidebar" id="sidebar">
        <div class="brand">
          <span class="logo-mark">T</span>
          <span class="brand-name">Traffic<b>Sense</b></span>
        </div>
        <nav>${navHtml}</nav>
        <div class="side-foot">
          v1.0 · Smart City Suite<br/>
          <a href="#" id="logout-link">Sign out</a>
        </div>
      </aside>
      <div class="main">
        <header class="topbar">
          <div class="flex items-center gap-2">
            <button class="icon-btn menu-toggle" id="menu-toggle" aria-label="Toggle menu">☰</button>
            <div class="page-title">
              <h1>${title}</h1>
              ${subtitle ? `<p>${subtitle}</p>` : ""}
            </div>
          </div>
          <div class="top-actions">
            <button class="icon-btn" id="theme-toggle" title="Toggle theme">🌓</button>
            <button class="icon-btn" title="Notifications">🔔</button>
            <div class="user-chip">
              <span class="avatar">${initials}</span>
              <span class="name">${session.fullName || session.username}</span>
            </div>
          </div>
        </header>
        <main class="content fade-in">${content}</main>
      </div>
    </div>
  `;
  document.getElementById("app-shell").innerHTML = shellHtml;

  document.getElementById("logout-link").onclick = (e) => {
    e.preventDefault(); Auth.logout(); window.location.replace("login.html");
  };
  document.getElementById("theme-toggle").onclick = () => {
    const t = UI.toggleTheme();
    UI.toast(`Switched to ${t} mode`, "success", 1600);
  };
  document.getElementById("menu-toggle").onclick = () => {
    document.getElementById("sidebar").classList.toggle("open");
  };
  UI.scrollTop();
}
