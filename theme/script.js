/* ===============================
   DRAWER MENU
================================ */
const menuBtn = document.getElementById("menuToggle");
const drawer = document.getElementById("drawer");

menuBtn?.addEventListener("click", () => {
  drawer.classList.toggle("open");
});

/* ===============================
   DARK MODE
================================ */
const themeBtn = document.getElementById("toggleTheme");
const root = document.documentElement;

themeBtn?.addEventListener("click", () => {
  root.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    root.classList.contains("dark") ? "dark" : "light"
  );
});

// Load saved theme
if (localStorage.getItem("theme") === "dark") {
  root.classList.add("dark");
}

/* ===============================
   LANGUAGE SWITCH (UI ONLY)
================================ */
const langBtn = document.getElementById("toggleLang");

langBtn?.addEventListener("click", () => {
  root.classList.toggle("lang-id");
  root.classList.toggle("lang-en");
});
