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
