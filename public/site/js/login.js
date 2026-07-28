Auth.redirectIfAuthed("dashboard.html");

document.querySelectorAll(".pw-toggle").forEach(btn => {
  btn.addEventListener("click", () => {
    const input = document.getElementById(btn.dataset.target);
    if (!input) return;
    const isPw = input.type === "password";
    input.type = isPw ? "text" : "password";
    btn.textContent = isPw ? "Hide" : "Show";
  });
});

document.getElementById("forgot").addEventListener("click", (e) => {
  e.preventDefault();
  const email = prompt("Enter your registered email to simulate a password reset:");
  if (!email) return;
  const users = Auth.getUsers();
  const u = users.find(x => x.email.toLowerCase() === email.toLowerCase());
  if (!u) { UI.toast("No account with that email.", "error"); return; }
  UI.toast("Password reset link sent (simulation).", "success");
});

document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const id = document.getElementById("identifier").value.trim();
  const pw = document.getElementById("password").value;
  const remember = document.getElementById("remember").checked;
  document.getElementById("err-identifier").textContent = "";
  document.getElementById("err-password").textContent = "";

  if (!id) { document.getElementById("err-identifier").textContent = "Email or username is required."; return; }
  if (!pw) { document.getElementById("err-password").textContent = "Password is required."; return; }

  UI.loader(true);
  setTimeout(() => {
    const res = Auth.login(id, pw, remember);
    UI.loader(false);
    if (!res.ok) { UI.toast(res.error, "error"); return; }
    UI.toast(`Welcome back, ${res.session.fullName || res.session.username}!`, "success");
    setTimeout(() => window.location.replace("dashboard.html"), 500);
  }, 400);
});
