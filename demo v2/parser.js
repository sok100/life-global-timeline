/**
 * parser.js
 * Transforms raw textarea lines into a sorted array of structured events.
 * Design rules:
 *  - Invalid lines are skipped (never fatal) and logged with their line number.
 *  - Category names are validated against a strict whitelist (they become CSS
 *    class fragments / color keys), unknown ones fall back to "other".
 */
(function (LT) {
  'use strict';

  // Expected line format:
  // DATE: YYYY.MM.DD | TYPE: LOCAL/GLOBAL | CAT: category | TEXT: description
  var LINE_REGEX =
    /^DATE:\s*(\d{4}\.\d{2}\.\d{2})\s*\|\s*TYPE:\s*(LOCAL|GLOBAL)\s*\|\s*CAT:\s*([a-z0-9_-]+)\s*\|\s*TEXT:\s*(.+)$/i;

  // Whitelist — mirrors the taxonomy documented in the README.
  var VALID_CATEGORIES = {
    // Global
    conflict: true, politics: true, crisis: true, science: true, culture: true,
    // Local
    milestone: true, education: true, career: true, relationship: true,
    residence: true, travel: true, social: true
  };

  var FALLBACK_CATEGORY = 'other';

  // Monotonic counter, reset on every full parse → stable unique ids per run.
  var idCounter = 0;

  /** Normalize a raw category name; anything unknown becomes "other". */
  function validateCategory(raw) {
    var cat = String(raw).toLowerCase().trim();
    return VALID_CATEGORIES[cat] ? cat : FALLBACK_CATEGORY;
  }

  /**
   * Parse a single line.
   * @returns {Object|null} Event object, or null if the line is invalid.
   */
  function parseLine(line, lineNumber) {
    var trimmed = line.trim();

    // Silently skip blank lines and // comments.
    if (!trimmed || trimmed.indexOf('//') === 0) return null;

    var match = trimmed.match(LINE_REGEX);
    if (!match) {
      console.warn('[Line ' + lineNumber + '] Invalid format — line skipped: "' + trimmed.slice(0, 60) + '"');
      return null;
    }

    var dateStr = match[1];
    var parts = dateStr.split('.');
    var y = Number(parts[0]), m = Number(parts[1]), d = Number(parts[2]);

    // Build the Date and reject impossible dates (e.g. month 13, day 32)
    // that JavaScript would otherwise silently roll over.
    var date = new Date(y, m - 1, d);
    if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
      console.warn('[Line ' + lineNumber + '] Impossible date "' + dateStr + '" — line skipped.');
      return null;
    }

    return {
      id: 'evt-' + (++idCounter),
      date: date,
      dateStr: dateStr,
      type: match[2].toUpperCase(),
      cat: validateCategory(match[3]),
      text: match[4].trim()
    };
  }

  /**
   * Parse the whole textarea content.
   * @returns {Array} Events sorted chronologically (stable for equal dates).
   */
  function parseTimeline(rawText) {
    idCounter = 0;
    var lines = String(rawText).split('\n');
    var events = [];

    for (var i = 0; i < lines.length; i++) {
      var event = parseLine(lines[i], i + 1);
      if (event) events.push(event);
    }

    events.sort(function (a, b) { return a.date - b.date || a.id.localeCompare(b.id); });
    return events;
  }

  // Public API
  LT.parser = { parseLine: parseLine, parseTimeline: parseTimeline };
})(window.LT = window.LT || {});