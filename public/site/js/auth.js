/* ==========================================================
   TrafficSense AI — Authentication (LocalStorage only)
   ========================================================== */

const AUTH_KEYS = {
  USERS: "tsai_users",
  SESSION: "tsai_session",
  THEME: "tsai_theme",
  SETTINGS: "tsai_settings",
};

const Auth = {
  getUsers() {
    try { return JSON.parse(localStorage.getItem(AUTH_KEYS.USERS) || "[]"); }
    catch { return []; }
  },
  saveUsers(users) {
    localStorage.setItem(AUTH_KEYS.USERS, JSON.stringify(users));
  },
  register(user) {
    const users = this.getUsers();
    if (users.some(u => u.email.toLowerCase() === user.email.toLowerCase()))
      return { ok: false, error: "This email is already registered." };
    if (users.some(u => u.username.toLowerCase() === user.username.toLowerCase()))
      return { ok: false, error: "This username is taken." };
    users.push({ ...user, createdAt: Date.now() });
    this.saveUsers(users);
    return { ok: true };
  },
  login(identifier, password, remember) {
    const users = this.getUsers();
    const user = users.find(
      u => u.email.toLowerCase() === identifier.toLowerCase()
        || u.username.toLowerCase() === identifier.toLowerCase()
    );
    if (!user) return { ok: false, error: "No account found with this email/username." };
    if (user.password !== password) return { ok: false, error: "Incorrect password." };
    const session = { email: user.email, username: user.username, fullName: user.fullName, mobile: user.mobile, loginAt: Date.now(), remember: !!remember };
    localStorage.removeItem(AUTH_KEYS.SESSION);
    sessionStorage.removeItem(AUTH_KEYS.SESSION);
    (remember ? localStorage : sessionStorage).setItem(AUTH_KEYS.SESSION, JSON.stringify(session));
    return { ok: true, session };
  },
  session() {
    try {
      return JSON.parse(
        localStorage.getItem(AUTH_KEYS.SESSION) ||
        sessionStorage.getItem(AUTH_KEYS.SESSION) ||
        "null"
      );
    } catch { return null; }
  },
  updateProfile(updates) {
    const s = this.session(); if (!s) return { ok: false };
    const users = this.getUsers();
    const idx = users.findIndex(u => u.email.toLowerCase() === s.email.toLowerCase());
    if (idx < 0) return { ok: false };
    users[idx] = { ...users[idx], ...updates };
    this.saveUsers(users);
    const newSession = { ...s, ...updates };
    if (localStorage.getItem(AUTH_KEYS.SESSION)) localStorage.setItem(AUTH_KEYS.SESSION, JSON.stringify(newSession));
    else sessionStorage.setItem(AUTH_KEYS.SESSION, JSON.stringify(newSession));
    return { ok: true, session: newSession };
  },
  changePassword(oldPw, newPw) {
    const s = this.session(); if (!s) return { ok: false, error: "Not signed in." };
    const users = this.getUsers();
    const idx = users.findIndex(u => u.email.toLowerCase() === s.email.toLowerCase());
    if (idx < 0) return { ok: false, error: "Account not found." };
    if (users[idx].password !== oldPw) return { ok: false, error: "Current password is incorrect." };
    users[idx].password = newPw;
    this.saveUsers(users);
    return { ok: true };
  },
  logout() {
    localStorage.removeItem(AUTH_KEYS.SESSION);
    sessionStorage.removeItem(AUTH_KEYS.SESSION);
  },
  requireAuth(redirect = "login.html") {
    if (!this.session()) window.location.replace(redirect);
  },
  redirectIfAuthed(target = "dashboard.html") {
    if (this.session()) window.location.replace(target);
  }
};

/* ---------- UI helpers used everywhere ---------- */
const UI = {
  toast(msg, type = "info", ms = 3200) {
    let c = document.querySelector(".toast-container");
    if (!c) { c = document.createElement("div"); c.className = "toast-container"; document.body.appendChild(c); }
    const t = document.createElement("div");
    t.className = "toast " + type;
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(() => { t.style.opacity = "0"; t.style.transform = "translateX(120%)"; t.style.transition = "all .3s"; }, ms - 300);
    setTimeout(() => t.remove(), ms);
  },
  loader(show) {
    let l = document.querySelector(".loader-overlay");
    if (show) {
      if (l) return;
      l = document.createElement("div"); l.className = "loader-overlay";
      l.innerHTML = '<div class="spinner"></div>';
      document.body.appendChild(l);
    } else if (l) l.remove();
  },
  initTheme() {
    const saved = localStorage.getItem(AUTH_KEYS.THEME) || "light";
    document.documentElement.setAttribute("data-theme", saved);
    return saved;
  },
  toggleTheme() {
    const cur = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", cur);
    localStorage.setItem(AUTH_KEYS.THEME, cur);
    return cur;
  },
  scrollTop() {
    const btn = document.createElement("button");
    btn.className = "scroll-top"; btn.innerHTML = "↑"; btn.setAttribute("aria-label", "Scroll to top");
    btn.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
    document.body.appendChild(btn);
    window.addEventListener("scroll", () => btn.classList.toggle("show", window.scrollY > 400));
  }
};

// Initialize theme immediately on every page
UI.initTheme();
