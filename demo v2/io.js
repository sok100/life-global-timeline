/**
 * io.js
 * Export (JSON / CSV) and import (CSV / JSON).
 * Import converts any supported file back into the canonical line format
 * and appends it to the textarea; the parser remains the single validator.
 */
(function (LT) {
  'use strict';

  // ── Export helpers ──────────────────────────────────────────────

  /** Trigger a client-side download via a temporary object URL. */
  function downloadFile(content, filename, mimeType) {
    var blob = new Blob([content], { type: mimeType });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /** Strip runtime-only fields; keep the portable shape. */
  function toPortable(events) {
    return events.map(function (e) {
      return { date: e.dateStr, type: e.type, cat: e.cat, text: e.text };
    });
  }

  function exportJSON(events) {
    downloadFile(JSON.stringify(toPortable(events), null, 2), 'timeline.json', 'application/json');
  }

  function exportCSV(events) {
    var header = 'date,type,cat,text';
    var rows = toPortable(events).map(function (e) {
      // RFC-4180 escaping: wrap in quotes, double any inner quotes.
      return e.date + ',' + e.type + ',' + e.cat + ',"' + e.text.replace(/"/g, '""') + '"';
    });
    downloadFile([header].concat(rows).join('\n'), 'timeline.csv', 'text/csv');
  }

  // ── Import helpers ──────────────────────────────────────────────

  /** Read a File as text, promise-wrapped. */
  function readAsText(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.onerror = function () { reject(new Error('Could not read the file.')); };
      reader.readAsText(file);
    });
  }

  /** Format one record into the canonical line; null if incomplete. */
  function toLine(item) {
    if (!item || !item.date || !item.type || !item.cat || !item.text) return null;
    return 'DATE: ' + String(item.date).trim() +
           ' | TYPE: ' + String(item.type).trim().toUpperCase() +
           ' | CAT: ' + String(item.cat).trim().toLowerCase() +
           ' | TEXT: ' + String(item.text).trim();
  }

  /**
   * Split a CSV line on commas, honoring double-quoted fields.
   * (Lookahead trick: only split on commas followed by an even
   * number of quotes, i.e. outside any quoted section.)
   */
  function splitCsvLine(line) {
    return line
      .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
      .map(function (p) { return p.replace(/^"|"$/g, '').replace(/""/g, '"').trim(); });
  }

  /** Import a .csv file → canonical lines (Promise<string>). */
  function importCSV(file) {
    return readAsText(file).then(function (content) {
      var lines = content.split(/\r?\n/).filter(function (l) { return l.trim(); });

      // Drop a header row if present.
      var start = lines.length && lines[0].toLowerCase().indexOf('date') === 0 ? 1 : 0;

      var out = [];
      for (var i = start; i < lines.length; i++) {
        var cols = splitCsvLine(lines[i]);
        if (cols.length < 4) continue; // not enough columns — skip
        var line = toLine({ date: cols[0], type: cols[1], cat: cols[2], text: cols.slice(3).join(',') });
        if (line) out.push(line);
      }
      if (!out.length) throw new Error('No valid rows found in the CSV.');
      return out.join('\n');
    });
  }

  /** Import a .json file (array of {date,type,cat,text}) → canonical lines. */
  function importJSON(file) {
    return readAsText(file).then(function (content) {
      var data;
      try { data = JSON.parse(content); }
      catch (e) { throw new Error('File is not valid JSON.'); }

      if (!Array.isArray(data)) throw new Error('The JSON root must be an array of events.');

      var out = data.map(toLine).filter(Boolean);
      if (!out.length) throw new Error('No valid events found in the JSON.');
      return out.join('\n');
    });
  }

  // Public API
  LT.io = {
    exportJSON: exportJSON,
    exportCSV: exportCSV,
    importCSV: importCSV,
    importJSON: importJSON
  };
})(window.LT = window.LT || {});