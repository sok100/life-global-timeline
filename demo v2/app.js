/* @file app.js | @version 1.2.0 | @updated 2026-07-21 | Life × Global Timeline */
/**
 * app.js
 * Orchestrator: wires parser, renderer, storage, filters, theme and io
 * to the page. Loaded last; everything else is registered on window.LT.
 */
(function (LT) {
  'use strict';

  // ── State ───────────────────────────────────────────────────────
  var allEvents = []; // last parsed dataset (unfiltered)

  // ── DOM references ──────────────────────────────────────────────
  var textarea = document.getElementById('input-data');
  var btnGenerate = document.getElementById('btn-generate');
  var btnClear = document.getElementById('btn-clear');
  var btnExportJSON = document.getElementById('btn-export-json');
  var btnExportCSV = document.getElementById('btn-export-csv');
  var btnImport = document.getElementById('btn-import');
  var fileInput = document.getElementById('file-input');
  var filterPanel = document.getElementById('filter-panel');
  var output = document.getElementById('timeline-output');
  var statLocal = document.getElementById('stat-local');
  var statGlobal = document.getElementById('stat-global');
  var statSpan = document.getElementById('stat-span');

  // ── Helpers ─────────────────────────────────────────────────────

  /** Animate a stat change with a quick scale bump. */
  function setStat(node, value) {
    var text = String(value);
    if (node.textContent === text) return;
    node.textContent = text;
    node.classList.remove('bump');
    void node.offsetWidth; // restart the CSS animation
    node.classList.add('bump');
  }

  /** Refresh the masthead statistics from the currently visible events. */
  function updateStats(events) {
    var local = 0, global = 0, min = Infinity, max = -Infinity;
    events.forEach(function (e) {
      if (e.type === 'LOCAL') local++; else global++;
      var y = e.date.getFullYear();
      if (y < min) min = y;
      if (y > max) max = y;
    });
    setStat(statLocal, local);
    setStat(statGlobal, global);
    setStat(statSpan, events.length ? (max - min + 1) : '—');
  }

  /** Crossfade between timeline states where the View Transitions API exists. */
  function renderWithTransition(events) {
    if (document.startViewTransition) {
      document.startViewTransition(function () {
        LT.renderer.renderTimeline(events, output);
      });
    } else {
      LT.renderer.renderTimeline(events, output);
    }
  }

  // ── Core actions ────────────────────────────────────────────────

  /** Parse the textarea, rebuild filters, render everything. */
  function handleGenerate() {
    var raw = textarea.value;
    allEvents = LT.parser.parseTimeline(raw);
    LT.storage.saveTimelineData(raw);

    // Filter panel drives re-renders of the same parsed dataset.
    LT.filters.createFilterUI(allEvents, filterPanel, function (activeCats, yearMin, yearMax) {
      var filtered = LT.filters.filterEvents(allEvents, activeCats, yearMin, yearMax);
      renderWithTransition(filtered);
      updateStats(filtered);
    });

    renderWithTransition(allEvents);
    updateStats(allEvents);
  }

  /** Import CSV/JSON: convert to canonical lines, append, regenerate. */
  function handleImport(e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;

    var importer = /\.json$/i.test(file.name) ? LT.io.importJSON : LT.io.importCSV;

    importer(file).then(function (lines) {
      textarea.value = textarea.value.trim() ? textarea.value.trim() + '\n' + lines : lines;
      handleGenerate();
    }).catch(function (err) {
      alert('Import failed: ' + err.message);
    }).then(function () {
      fileInput.value = ''; // allow re-importing the same file
    });
  }

  function handleClear() {
    textarea.value = '';
    LT.storage.clearTimelineData();
    allEvents = [];
    filterPanel.innerHTML = '';
    LT.renderer.renderTimeline([], output);
    updateStats([]);
  }

  // ── Boot ────────────────────────────────────────────────────────

  function init() {
    LT.theme.initTheme();

    // Restore the last session, if any.
    var saved = LT.storage.loadTimelineData();
    if (saved) textarea.value = saved;

    btnGenerate.addEventListener('click', handleGenerate);
    btnClear.addEventListener('click', handleClear);
    btnExportJSON.addEventListener('click', function () { LT.io.exportJSON(allEvents); });
    btnExportCSV.addEventListener('click', function () { LT.io.exportCSV(allEvents); });
    btnImport.addEventListener('click', function () { fileInput.click(); });
    fileInput.addEventListener('change', handleImport);

    // Auto-save while typing (debounced inside storage.js).
    textarea.addEventListener('input', function () { LT.storage.autoSave(textarea.value); });

    // Power-user shortcut: Ctrl/Cmd + Enter regenerates.
    textarea.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleGenerate();
      }
    });

    // Render immediately when restored data exists.
    if (saved) handleGenerate();
  }

  document.addEventListener('DOMContentLoaded', init);
})(window.LT = window.LT || {});
