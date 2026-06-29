document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const inputField = document.getElementById('data-input');

    generateBtn.addEventListener('click', () => {
        renderTimeline(inputField.value);
    });

    // Randează automat setul de date predefinit (deja prezent în textarea) la încărcarea paginii.
    renderTimeline(inputField.value);
});

// Doar litere/cifre/underscore/dash sunt acceptate ca nume de categorie,
// pentru că valoarea e folosită direct ca nume de clasă CSS (cat-${cat}).
// Orice altceva ar putea injecta atribute HTML neintenționate.
const VALID_CAT_REGEX = /^[a-z0-9_-]+$/;

/**
 * Parsează o singură linie din formatul:
 * DATE: YYYY.MM.DD | TYPE: LOCAL/GLOBAL | CAT: categorie | TEXT: descriere
 * Returnează null dacă linia nu respectă formatul (linie ignorată, nu crashează aplicația).
 */
function parseLine(line) {
    const parts = line.split('|').map(p => p.trim());
    if (parts.length < 4) return null;

    const dateRaw = parts[0].replace(/DATE:/i, '').trim();
    const typeRaw = parts[1].replace(/TYPE:/i, '').trim().toUpperCase();
    const catRaw = parts[2].replace(/CAT:/i, '').trim().toLowerCase();
    const textRaw = parts.slice(3).join('|').replace(/TEXT:/i, '').trim();

    const dateMatch = dateRaw.match(/^(\d{4})\.(\d{1,2})\.(\d{1,2})$/);
    if (!dateMatch) return null;

    const year = parseInt(dateMatch[1], 10);
    const month = parseInt(dateMatch[2], 10);
    const day = parseInt(dateMatch[3], 10);

    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    if (typeRaw !== 'GLOBAL' && typeRaw !== 'LOCAL') return null;
    if (!textRaw) return null;

    const cat = VALID_CAT_REGEX.test(catRaw) ? catRaw : 'other';

    return {
        year, month, day,
        // Cheie numerică simplă pentru sortare cronologică corectă — fără ambiguități
        // de parsare de tip new Date("an.lună.zi") care pot da Invalid Date.
        dateKey: year * 10000 + month * 100 + day,
        dateDisplay: `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}`,
        type: typeRaw,
        cat,
        text: textRaw
    };
}

function renderTimeline(rawData) {
    const output = document.getElementById('timeline-output');
    const legendOutput = document.getElementById('legend-container');

    if (!rawData.trim()) {
        alert('Nu există date introduse!');
        return;
    }

    const lines = rawData.split('\n').filter(l => l.trim() !== '');

    const events = [];
    const invalidLines = [];
    lines.forEach((line, idx) => {
        const parsed = parseLine(line);
        if (parsed) {
            events.push(parsed);
        } else {
            invalidLines.push(idx + 1);
        }
    });

    if (invalidLines.length > 0) {
        console.warn(
            `Linii ignorate (format invalid, verifică sintaxa DATE: YYYY.MM.DD | TYPE: ... | CAT: ... | TEXT: ...): ${invalidLines.join(', ')}`
        );
    }

    if (events.length === 0) {
        alert('Nicio linie validă găsită. Format necesar:\nDATE: YYYY.MM.DD | TYPE: LOCAL/GLOBAL | CAT: categorie | TEXT: descriere');
        return;
    }

    // Sortare cronologică pe baza cheii numerice (an*10000 + lună*100 + zi)
    events.sort((a, b) => a.dateKey - b.dateKey);

    // Grupare pe ani folosind un Map, apoi ordonăm explicit cheile (anii) crescător.
    const yearsMap = new Map();
    events.forEach(ev => {
        if (!yearsMap.has(ev.year)) yearsMap.set(ev.year, { global: [], local: [] });
        const bucket = yearsMap.get(ev.year);
        if (ev.type === 'GLOBAL') bucket.global.push(ev);
        else bucket.local.push(ev);
    });
    const sortedYears = [...yearsMap.keys()].sort((a, b) => a - b);

    // Construcție DOM sigură (createElement + textContent), fără innerHTML cu date din input.
    // Astfel textul introdus de utilizator nu poate injecta HTML/JS (XSS).
    output.replaceChildren();

    sortedYears.forEach(year => {
        const data = yearsMap.get(year);

        const yearBlock = document.createElement('div');
        yearBlock.className = 'year-block';

        const globalCol = document.createElement('div');
        globalCol.className = 'events-column global-col';
        globalCol.style.justifyContent = 'flex-end';
        globalCol.style.paddingBottom = '15px';
        globalCol.style.alignItems = 'center';
        data.global.forEach(ev => globalCol.appendChild(createCardElement(ev)));

        const yearLabel = document.createElement('div');
        yearLabel.className = 'year-label';
        yearLabel.textContent = String(year);

        const localCol = document.createElement('div');
        localCol.className = 'events-column local-col';
        localCol.style.justifyContent = 'flex-start';
        localCol.style.paddingTop = '15px';
        localCol.style.alignItems = 'center';
        data.local.forEach(ev => localCol.appendChild(createCardElement(ev)));

        yearBlock.appendChild(globalCol);
        yearBlock.appendChild(yearLabel);
        yearBlock.appendChild(localCol);
        output.appendChild(yearBlock);
    });

    // Legendă dinamică, construită tot prin DOM API (sigur).
    legendOutput.replaceChildren();
    const usedCats = [...new Set(events.map(e => e.cat))];
    usedCats.forEach(cat => {
        const item = document.createElement('div');
        item.className = 'legend-item';

        const dot = document.createElement('span');
        dot.className = `dot cat-${cat}`;

        const label = document.createElement('span');
        label.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);

        item.appendChild(dot);
        item.appendChild(label);
        legendOutput.appendChild(item);
    });
}

function createCardElement(ev) {
    const card = document.createElement('div');
    card.className = `event-card cat-${ev.cat}`;

    const dateBadge = document.createElement('span');
    dateBadge.className = 'date-badge';
    dateBadge.textContent = ev.dateDisplay;

    const typeBadge = document.createElement('span');
    typeBadge.className = `type-badge ${ev.type === 'GLOBAL' ? 'type-global' : 'type-local'}`;
    typeBadge.textContent = `[${ev.type.charAt(0)}]`;

    card.appendChild(dateBadge);
    card.appendChild(typeBadge);
    card.appendChild(document.createTextNode(' ' + ev.text));

    return card;
}
