/* @file renderer.js | @version 1.2.0 | @updated 2026-07-21 | Life × Global Timeline */
/**
 * renderer.js
 * Events → DOM. Security model: every piece of user data enters the DOM
 * exclusively through textContent / createElement — never innerHTML —
 * so pasted markup can never execute.
 */
(function (LT) {
  'use strict';

  var TYPE_META = {
    LOCAL:  { icon: '🧑', label: 'Personal' },
    GLOBAL: { icon: '🌍', label: 'Global' }
  };

  var prefersReducedMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // One observer per page; reconnected on every render.
  var revealObserver = null;

  // ── Small builders ──────────────────────────────────────────────

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function categoryDot() {
    var dot = el('span', 'dot');
    dot.setAttribute('aria-hidden', 'true');
    return dot;
  }

  /** One event card with its Popover-API detail overlay. */
  function createEventCard(event) {
    var meta = TYPE_META[event.type] || TYPE_META.GLOBAL;

    var card = el('article', 'event-card');
    card.style.setProperty('--cat', LT.filters.colorOf(event.cat)); // drives all category coloring
    card.dataset.eventId = event.id;
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', event.dateStr + ' — ' + event.text);

    // Head row: mono date + tinted category chip
    var head = el('div', 'event-head');
    var date = el('time', 'event-date', event.dateStr);
    date.dateTime = event.dateStr.replace(/\./g, '-');
    var chip = el('span', 'event-chip');
    chip.appendChild(categoryDot());
    chip.appendChild(document.createTextNode(LT.filters.labelOf(event.cat)));
    head.appendChild(date);
    head.appendChild(chip);

    var text = el('p', 'event-text', event.text);

    // Details button → native popover (lightweight, non-modal)
    var infoBtn = el('button', 'event-info-btn', 'ℹ️');
    infoBtn.type = 'button';
    infoBtn.setAttribute('popovertarget', 'popover-' + event.id);
    infoBtn.setAttribute('aria-label', 'Details: ' + event.text);

    var popover = el('div', 'event-popover');
    popover.id = 'popover-' + event.id;
    popover.setAttribute('popover', 'auto');
    popover.appendChild(el('p', 'popover-title', event.text));
    popover.appendChild(el('p', 'popover-meta',
      '📅 ' + event.dateStr + '   ·   ' + meta.icon + ' ' + meta.label +
      '   ·   ' + LT.filters.labelOf(event.cat)));

    card.appendChild(head);
    card.appendChild(text);
    card.appendChild(infoBtn);
    card.appendChild(popover);
    return card;
  }

  /** Events of one axis grouped by year, with mono year headings. */
  function createYearGroups(events) {
    var fragment = document.createDocumentFragment();
    var currentYear = null;
    var group = null;

    events.forEach(function (event) {
      var year = event.date.getFullYear();
      if (year !== currentYear) {
        currentYear = year;
        group = el('div', 'year-group');
        group.appendChild(el('h3', 'year-label', String(year)));
        fragment.appendChild(group);
      }
      group.appendChild(createEventCard(event));
    });

    return fragment;
  }

  /** One axis (Personal or Global) with a sticky headed title. */
  function createAxis(cssClass, title, icon, events) {
    var axis = el('section', 'axis ' + cssClass);
    axis.setAttribute('role', 'list');
    axis.setAttribute('aria-label', title + ' (' + events.length + ' events)');

    var head = el('div', 'axis-head');
    head.appendChild(el('h2', 'axis-title', icon + ' ' + title));
    head.appendChild(el('span', 'axis-count', events.length + ' events'));
    axis.appendChild(head);

    axis.appendChild(createYearGroups(events));
    return axis;
  }

  /** Legend: distinct categories present, with occurrence counts. */
  function createLegend(events) {
    var counts = {};
    events.forEach(function (e) { counts[e.cat] = (counts[e.cat] || 0) + 1; });

    var legend = el('div', 'timeline-legend');
    legend.setAttribute('aria-label', 'Category legend');

    Object.keys(counts).sort().forEach(function (cat) {
      var item = el('span', 'legend-item');
      item.style.setProperty('--cat', LT.filters.colorOf(cat));
      item.appendChild(categoryDot());
      item.appendChild(document.createTextNode(LT.filters.labelOf(cat)));
      item.appendChild(el('span', 'count', '×' + counts[cat]));
      legend.appendChild(item);
    });
    return legend;
  }

  // ── Scroll reveal ───────────────────────────────────────────────

  /** Cards rise into view as they enter the viewport (staggered). */
  function observeReveals(container) {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) return;

    if (revealObserver) revealObserver.disconnect();
    container.classList.add('reveal-enabled');

    revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });

    var cards = container.querySelectorAll('.event-card');
    for (var i = 0; i < cards.length; i++) {
      // Stagger within each entering batch, then the delay is irrelevant.
      cards[i].style.setProperty('--reveal-delay', ((i % 10) * 40) + 'ms');
      revealObserver.observe(cards[i]);
    }
  }

  // ── Main entry point ────────────────────────────────────────────

  /** Render the full dual-axis timeline into the given container. */
  function renderTimeline(events, container) {
    container.innerHTML = '';

    if (!events.length) {
      container.appendChild(el('p', 'timeline-empty',
        'Nothing to show. Edit the data above and press “Generate Timeline”.'));
      return;
    }

    var local = events.filter(function (e) { return e.type === 'LOCAL'; });
    var global = events.filter(function (e) { return e.type === 'GLOBAL'; });

    var fragment = document.createDocumentFragment();
    fragment.appendChild(createLegend(events));

    var axes = el('div', 'axes-wrapper');
    axes.appendChild(createAxis('axis-local', 'My Life', '🧑', local));
    axes.appendChild(createAxis('axis-global', 'The World', '🌍', global));
    fragment.appendChild(axes);

    container.appendChild(fragment);
    observeReveals(container);
  }

  // Public API
  LT.renderer = { renderTimeline: renderTimeline };
})(window.LT = window.LT || {});
