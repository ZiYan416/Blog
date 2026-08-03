export const THEME_STORAGE_KEY = "theme"

export const THEME_INIT_SCRIPT = `
(function () {
  try {
    var savedTheme = localStorage.getItem("${THEME_STORAGE_KEY}");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var isDark = savedTheme === "dark" || (savedTheme !== "light" && prefersDark);
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  } catch (_) {}
})();`
