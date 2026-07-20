/* @file storage.js | @version 1.2.0 | @updated 2026-07-21 | Life × Global Timeline */
/**
 * storage.js
 * localStorage persistence with debounced auto-save, plus theme storage.
 * Every call is wrapped in try/catch: storage may be unavailable
 * (private browsing, quota, disabled) and the app must keep working.
 */
(function (LT) {
  'use strict';

  var DATA_KEY = 'life-timeline-data';
  var THEME_KEY = 'life-timeline-theme';
  var DEBOUNCE_MS = 1500;

  var debounceTimer = null;

  /** Persist the raw textarea content. */
  function saveTimelineData(text) {
    try { localStorage.setItem(DATA_KEY, text); }
    catch (e) { console.warn('[Storage] Save failed:', e); }
  }

  /** Load previously saved raw text ('' if none). */
  function loadTimelineData() {
    try { return localStorage.getItem(DATA_KEY) || ''; }
    catch (e) { return ''; }
  }

  /** Remove saved timeline data. */
  function clearTimelineData() {
    try { localStorage.removeItem(DATA_KEY); }
    catch (e) { /* noop */ }
  }

  /** Debounced auto-save — call on every textarea input event. */
  function autoSave(text) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      saveTimelineData(text);
    }, DEBOUNCE_MS);
  }

  /** Persist the user's explicit theme choice ('light' | 'dark'). */
  function saveTheme(theme) {
    try { localStorage.setItem(THEME_KEY, theme); }
    catch (e) { /* noop */ }
  }

  /** Load saved theme; null means "follow the system preference". */
  function loadTheme() {
    try { return localStorage.getItem(THEME_KEY) || null; }
    catch (e) { return null; }
  }

  // Public API
  LT.storage = {
    saveTimelineData: saveTimelineData,
    loadTimelineData: loadTimelineData,
    clearTimelineData: clearTimelineData,
    autoSave: autoSave,
    saveTheme: saveTheme,
    loadTheme: loadTheme
  };
})(window.LT = window.LT || {});
