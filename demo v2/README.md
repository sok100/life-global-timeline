## 🚀 Sprint 1–3 Implementat (iulie 2026)

### Arhitectură modulară (ES6)
| Fișier | Responsabilitate |
|---|---|
| `parser.js` | Parsare text → `Event[]` (regex, validare CAT, sortare) |
| `renderer.js` | `Event[]` → DOM (`DocumentFragment`, `createElement`, Popover API) |
| `storage.js` | `localStorage` — auto-save (debounce 2s), load, clear, theme |
| `filters.js` | Filtrare categorii (checkbox) + interval ani (dual slider) |
| `theme.js` | Dark/Light mode (CSS variables, `prefers-color-scheme`, persistență) |
| `io.js` | Import/Export CSV + JSON |
| `app.js` | Orchestrator + View Transitions API |
| `styles.css` | Toate stilurile (light/dark, carduri, categorii, popover) |


---

## ✅ Ce ai acum funcțional

| Feature | Status |
|---|---|
| Parsare + validare + skip linii invalide | ✅ |
| Randare `DocumentFragment` (zero `innerHTML` pe user data) | ✅ |
| Auto-save `localStorage` (debounce 2s) | ✅ |
| Dark / Light mode (toggle + system preference) | ✅ |
| Filtrare categorii (checkbox) + interval ani (slider) | ✅ |
| View Transitions API la filtrare | ✅ |
| Export JSON / CSV | ✅ |
| Import CSV / JSON | ✅ |
| Popover API pe fiecare card | ✅ |
| CSP strict (`default-src 'self'`) | ✅ |
| Responsive (grid 2 col → 1 col pe mobil) | ✅ |
| Skip-link + ARIA labels + `aria-live` | ✅ |

---

**Sprint 4 (Causal Links)** și **Sprint 5 (Virtual Scroll + CI)** rămân în TODO. Când vrei să le atacăm, spune-mi. 🚀

### files

life-global-timeline/
└── demo/
    ├── index.html
    ├── styles.css
    ├── parser.js
    ├── storage.js
    ├── filters.js
    ├── theme.js
    ├── io.js
    ├── renderer.js
    └── app.js
    └── README.md

## ✨ Ce e nou față de versiunea anterioară
Aspect
Înainte
Acum
Comentarii
Română
Engleză (toate fișierele)
Design
Carduri plate, header generic
Estetică de „registru de arhivă": fundal stratificat (dot-grid + wash), masthead cu riglă dublă, spine punctat între axe
Statistici
—
Statistici live în masthead (personale / globale / interval de ani), cu animație la schimbare
Grupare
Carduri simple
Grupare pe ani cu heading mono + riglă
Mișcare
Doar hover
Scroll-reveal eșalonat (IntersectionObserver, respectă prefers-reduced-motion), micro-interacțiuni pe butoane/toggle/popover
Culori categorii
13 clase CSS duplicate
O singură sursă (CATEGORY_COLORS în JS → --cat custom property)
Randare
Axe goale
Axe cu header sticky și contor de evenimente
Shortcut
—
Ctrl+Enter generează timeline-ul
Verificare rapidă: dublu-click pe demo/index.html → timeline-ul se randează instant, consola (F12) e curată, filtrele/trema/exportul funcționează.


###    ✅ Checklist de verificare
După ce aplici modificările, deschide demo/index.html prin dublu-click și confirmă:
Timeline-ul se randează imediat (datele din textarea)
Consola (F12) nu arată erori CORS sau 404
Toggle-ul dark/light funcționează și persistă la reload
Filtrele (categorii + slider ani) funcționează
Export JSON/CSV descarcă fișiere
La reload, textul din textarea e restaurat din localStorage
