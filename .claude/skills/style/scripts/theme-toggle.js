/*
 * Tideway optional theme toggle.
 *
 * Persists a light/dark/auto choice and applies it by setting `data-theme`
 * on <html>. Core styling never depends on this — auto mode (following the OS)
 * is pure CSS. Add only with the user's go-ahead.
 *
 * Two parts:
 *   1. A tiny inline snippet in <head>, BEFORE any stylesheet, to apply the
 *      stored choice before first paint (prevents a flash of the wrong theme).
 *   2. This module, loaded normally, to wire up a toggle control.
 *
 * Inline <head> snippet (copy verbatim):
 *   <script>
 *     const t = localStorage.getItem("theme");
 *     if (t === "light" || t === "dark") document.documentElement.dataset.theme = t;
 *   </script>
 */

const STORAGE_KEY = "theme";
const root = document.documentElement;

/** "light" | "dark" | "auto" — "auto" removes the override and follows the OS. */
export function setTheme(theme) {
	if (theme === "auto") {
		delete root.dataset.theme;
		localStorage.removeItem(STORAGE_KEY);
	} else {
		root.dataset.theme = theme;
		localStorage.setItem(STORAGE_KEY, theme);
	}
}

/** The stored choice, or "auto" when none is set. */
export function getTheme() {
	return localStorage.getItem(STORAGE_KEY) || "auto";
}

/** Flip between light and dark based on what's currently showing. */
export function toggleTheme() {
	const current =
		root.dataset.theme ||
		(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
	setTheme(current === "dark" ? "light" : "dark");
}

/** Wire a button: each click flips the theme. */
export function bindToggle(el) {
	el.addEventListener("click", toggleTheme);
}
