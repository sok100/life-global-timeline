/* @file theme.js | @version 1.2.0 | @updated 2026-07-21 | Life × Global Timeline */
/**
 * theme.js
 * Light/dark theme. Priority: explicit user choice (localStorage)
 * > system preference (prefers-color-scheme) > light.
 */
(function (LT) {
  'use strict';

  var ICONS = { light: '🌙', dark: '☀️' }; // icon shows what you switch TO

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function initialTheme() {
    var saved = LT.storage.loadTheme();
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  /** Wire up the toggle button and system-preference tracking. */
  function initTheme() {
    var btn = document.getElementById('theme-toggle');
    var theme = initialTheme();

    applyTheme(theme);
    btn.textContent = ICONS[theme];

    btn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      LT.storage.saveTheme(next); // mark as explicit user choice
      btn.textContent = ICONS[next];
    });

    // Follow OS changes live — but only if the user never chose manually.
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      if (LT.storage.loadTheme()) return; // manual override wins
      var next = e.matches ? 'dark' : 'light';
      applyTheme(next);
      btn.textContent = ICONS[next];
    });
  }

  // Public API
  LT.theme = { initTheme: initTheme };
})(window.LT = window.LT || {});
