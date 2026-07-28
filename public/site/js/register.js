Auth.redirectIfAuthed("dashboard.html");

document.querySelectorAll(".pw-toggle").forEach(btn => {
  btn.addEventListener("click", () => {
    const input = document.getElementById(btn.dataset.target);
    const isPw = input.type === "password";
    input.type = isPw ? "text" : "password";
    btn.textContent = isPw ? "Hide" : "Show";
  });
});

function pwScore(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (pw.length >= 12) s++;
  return s; // 0..5
}
document.getElementById("password").addEventListener("input", (e) => {
  const s = pwScore(e.target.value);
  const bar = document.getElementById("pw-bar");
  const colors = ["#ef4444","#f97316","#f59e0b","#22c55e","#16a34a","#059669"];
  const labels = ["Very weak","Weak","Fair","Good","Strong","Excellent"];
  bar.style.width = (s / 5 * 100) + "%";
  bar.style.background = colors[s];
  document.getElementById("pw-hint").textContent = e.target.value ? "Strength: " + labels[s] : "Use 8+ characters with letters, numbers & symbols.";
});

document.getElementById("reg-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const v = id => document.getElementById(id).value.trim();
  const set = (id, msg) => document.getElementById("err-" + id).textContent = msg || "";
  ["fullName","username","mobile","email","password","confirm"].forEach(k => set(k, ""));

  const data = {
    fullName: v("fullName"),
    username: v("username"),
    mobile: v("mobile"),
    email: v("email"),
    password: document.getElementById("password").value,
    confirm: document.getElementById("confirm").value,
  };

  let bad = false;
  if (!data.fullName) { set("fullName", "Full name is required."); bad = true; }
  if (!/^[a-zA-Z0-9_]{3,}$/.test(data.username)) { set("username", "3+ letters, numbers or underscore."); bad = true; }
  if (!/^\+?[\d\s\-()]{7,20}$/.test(data.mobile)) { set("mobile", "Enter a valid mobile number."); bad = true; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) { set("email", "Enter a valid email."); bad = true; }
  if (data.password.length < 8) { set("password", "Minimum 8 characters."); bad = true; }
  if (data.password !== data.confirm) { set("confirm", "Passwords do not match."); bad = true; }
  if (bad) return;

  UI.loader(true);
  setTimeout(() => {
    const res = Auth.register({
      fullName: data.fullName, username: data.username, mobile: data.mobile,
      email: data.email, password: data.password
    });
    UI.loader(false);
    if (!res.ok) { UI.toast(res.error, "error"); return; }
    UI.toast("Account created! Please sign in.", "success");
    setTimeout(() => window.location.replace("login.html"), 700);
  }, 400);
});
