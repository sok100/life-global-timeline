/**
 * filters.js
 * Category taxonomy metadata (labels + colors — single source of truth),
 * pure filtering logic, and the filter panel UI (category chips + year range).
 */
(function (LT) {
  'use strict';

  // Display labels for every whitelisted category (+ fallback).
  var CATEGORY_LABELS = {
    conflict: '⚔ Conflict', politics: '🏛 Politics', crisis: '📉 Crisis',
    science: '🔬 Science', culture: '🎭 Culture',
    milestone: '🌱 Milestone', education: '🎓 Education', career: '💼 Career',
    relationship: '❤️ Relationship', residence: '🏠 Residence',
    travel: '✈️ Travel', social: '👥 Social',
    other: '📌 Other'
  };

  // Category colors — injected as a --cat CSS custom property on
  // chips, legend entries and event cards (kept out of the stylesheet
  // so there is exactly one place to edit the palette).
  var CATEGORY_COLORS = {
    conflict: '#d64550', politics: '#64748b', crisis: '#b4552d',
    science: '#2f9e8f', culture: '#9260c9',
    milestone: '#d4a72c', education: '#3b82c4', career: '#43a05f',
    relationship: '#d94f7e', residence: '#7d8f3f',
    travel: '#2bb3c7', social: '#b56576',
    other: '#8b8fa3'
  };

  function colorOf(cat) { return CATEGORY_COLORS[cat] || CATEGORY_COLORS.other; }
  function labelOf(cat) { return CATEGORY_LABELS[cat] || CATEGORY_LABELS.other; }

  /**
   * Pure filter: categories (empty Set = all) + inclusive year range.
   */
  function filterEvents(events, activeCats, yearMin, yearMax) {
    return events.filter(function (e) {
      var year = e.date.getFullYear();
      var catOk = activeCats.size === 0 || activeCats.has(e.cat);
      return catOk && year >= yearMin && year <= yearMax;
    });
  }

  /**
   * Build the filter panel UI for the current dataset.
   * @param {Array} events      Parsed events (unfiltered).
   * @param {HTMLElement} container  #filter-panel.
   * @param {Function} onChange  Called with (activeCats, yearMin, yearMax).
   */
  function createFilterUI(events, container, onChange) {
    container.innerHTML = '';
    if (!events.length) return;

    // Distinct categories/years actually present in the data.
    var catSet = {};
    var years = [];
    events.forEach(function (e) {
      catSet[e.cat] = true;
      years.push(e.date.getFullYear());
    });
    var cats = Object.keys(catSet).sort();
    var minYear = Math.min.apply(null, years);
    var maxYear = Math.max.apply(null, years);

    var activeCats = new Set(cats); // everything on by default
    var currentMin = minYear;
    var currentMax = maxYear;

    function emit() { onChange(activeCats, currentMin, currentMax); }

    // ── Category chips ──
    var fieldset = document.createElement('fieldset');
    fieldset.className = 'filter-cats';

    var legend = document.createElement('legend');
    legend.textContent = 'Categories';
    fieldset.appendChild(legend);

    cats.forEach(function (cat) {
      var label = document.createElement('label');
      label.className = 'filter-chip';
      label.style.setProperty('--cat', colorOf(cat));

      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = true;
      cb.addEventListener('change', function () {
        if (cb.checked) activeCats.add(cat); else activeCats.delete(cat);
        emit();
      });

      var dot = document.createElement('span');
      dot.className = 'dot';
      dot.setAttribute('aria-hidden', 'true');

      label.appendChild(cb);
      label.appendChild(dot);
      label.appendChild(document.createTextNode(labelOf(cat)));
      fieldset.appendChild(label);
    });

    // ── Year range (dual sliders) ──
    var row = document.createElement('div');
    row.className = 'filter-years';

    var caption = document.createElement('span');
    caption.className = 'years-caption';
    caption.textContent = 'Years';

    var minVal = document.createElement('span');
    minVal.className = 'year-val';
    minVal.textContent = minYear;

    var maxVal = document.createElement('span');
    maxVal.className = 'year-val';
    maxVal.textContent = maxYear;

    function makeRange(value, ariaLabel, onInput) {
      var input = document.createElement('input');
      input.type = 'range';
      input.min = minYear;
      input.max = maxYear;
      input.value = value;
      input.setAttribute('aria-label', ariaLabel);
      input.addEventListener('input', onInput);
      return input;
    }

    // Each slider clamps against the other so min never crosses max.
    var rangeMin = makeRange(minYear, 'Start year', function () {
      currentMin = Math.min(Number(rangeMin.value), currentMax);
      rangeMin.value = currentMin;
      minVal.textContent = currentMin;
      emit();
    });
    var rangeMax = makeRange(maxYear, 'End year', function () {
      currentMax = Math.max(Number(rangeMax.value), currentMin);
      rangeMax.value = currentMax;
      maxVal.textContent = currentMax;
      emit();
    });

    var dash = document.createElement('span');
    dash.textContent = '–';
    dash.setAttribute('aria-hidden', 'true');

    row.appendChild(caption);
    row.appendChild(minVal);
    row.appendChild(rangeMin);
    row.appendChild(dash);
    row.appendChild(rangeMax);
    row.appendChild(maxVal);

    container.appendChild(fieldset);
    container.appendChild(row);
  }

  // Public API
  LT.filters = {
    CATEGORY_LABELS: CATEGORY_LABELS,
    CATEGORY_COLORS: CATEGORY_COLORS,
    colorOf: colorOf,
    labelOf: labelOf,
    filterEvents: filterEvents,
    createFilterUI: createFilterUI
  };
})(window.LT = window.LT || {});