document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const loadBtn = document.getElementById('load-data-btn');
    const inputField = document.getElementById('data-input');

    generateBtn.addEventListener('click', () => {
        renderTimeline(inputField.value);
    });

    // Încarcă datele din data.txt extern
    loadBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('data.txt');
            if (!response.ok) throw new Error('File not found');
            const text = await response.text();
            inputField.value = text;
            renderTimeline(text);
        } catch (error) {
            alert('Could not load data.txt. Make sure you are running this on a local server (like Live Server in VS Code), not just double-clicking index.html.');
            console.error(error);
        }
    });
});

function renderTimeline(rawData) {
    const output = document.getElementById('timeline-output');
    const legendOutput = document.getElementById('legend-container');
    
    if (!rawData.trim()) return alert("No data provided!");

    // 1. Parse Data
    const lines = rawData.split('\n').filter(l => l.trim() !== '');
    const events = lines.map(line => {
        const parts = line.split('|').map(p => p.trim());
        return {
            year: parseInt(parts[0].replace('YEAR:', '')),
            date: parts[1].replace('DATE:', '').trim(),
            type: parts[2].replace('TYPE:', '').trim().toUpperCase(),
            cat: parts[3].replace('CAT:', '').trim().toLowerCase(),
            text: parts[4].replace('TEXT:', '').trim()
        };
    }).filter(e => !isNaN(e.year)); // Ignoră liniile invalide

    // 2. Sortare: An, apoi Dată (conversie dată pt sortare corectă)
    events.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        // Dacă nu are dată, îl pune la începutul anului
        const dateA = a.date ? `1970.${a.date}` : '1970.01.01';
        const dateB = b.date ? `1970.${b.date}` : '1970.01.01';
        return new Date(dateA) - new Date(dateB);
    });

    // 3. Grupare pe ani
    const yearsMap = {};
    events.forEach(ev => {
        if (!yearsMap[ev.year]) yearsMap[ev.year] = { global: [], local: [] };
        if (ev.type === 'GLOBAL') yearsMap[ev.year].global.push(ev);
        else yearsMap[ev.year].local.push(ev);
    });

    // 4. Generare HTML
    let htmlString = '';
    
    for (const [year, data] of Object.entries(yearsMap)) {
        htmlString += `<div class="year-block">`;
        
        // GLOBAL (Sus)
        htmlString += `<div class="events-column global-col" style="justify-content: flex-end; padding-bottom: 15px; align-items: center;">`;
        data.global.forEach(ev => {
            htmlString += createCardHTML(ev);
        });
        htmlString += `</div>`;

        // Anul
        htmlString += `<div class="year-label">${year}</div>`;

        // LOCAL (Jos)
        htmlString += `<div class="events-column local-col" style="justify-content: flex-start; padding-top: 15px; align-items: center;">`;
        data.local.forEach(ev => {
            htmlString += createCardHTML(ev);
        });
        htmlString += `</div>`;

        htmlString += `</div>`;
    }

    output.innerHTML = htmlString;
    
    // 5. Generare Legendă Dinamică
    const usedCats = [...new Set(events.map(e => e.cat))];
    let legendHtml = '';
    usedCats.forEach(cat => {
        legendHtml += `<div class="legend-item"><span class="dot cat-${cat}"></span>${cat.charAt(0).toUpperCase() + cat.slice(1)}</div>`;
    });
    legendOutput.innerHTML = legendHtml;
}

function createCardHTML(ev) {
    const typeClass = ev.type === 'GLOBAL' ? 'type-global' : 'type-local';
    const dateStr = ev.date ? ev.date : '';
    
    return `
        <div class="event-card cat-${ev.cat}">
            <span class="date-badge">${dateStr}</span>
            <span class="type-badge ${typeClass}">[${ev.type.charAt(0)}]</span>
            ${ev.text}
        </div>
    `;
}
