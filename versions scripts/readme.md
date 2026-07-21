# 1. Tu, la release:
python3 scripts/stamp_version.py 1.3.0
#    → stamp-ează linia 1 în toate fișierele
#    → regenerează version.js
#    → regenerează demo/versions.html  ← NOU

# 2. Utilizatorul care întâmpină un bug:
#    dublu-click pe demo/versions.html
#    → verifică badge-ul "VERIFIED ✓" (build-ul lui e cel stampat)
#    → apasă "Copy report (Markdown)"
#    → îl lipește în GitHub issue

Here is the solution defined as a formal GitHub Issue, written entirely in English and without any code blocks:

***

**Issue Title:** Feature Proposal: Self-Contained Version Manifest & Diagnostic Page for Bug Reporting (`versions.html`)

**Labels:** `enhancement`, `developer-experience`, `documentation`, `good first issue`

### 📝 Summary
This issue proposes a lightweight, zero-dependency versioning and diagnostic system. It introduces a developer-side "stamping" tool that tracks file versions across the project, and generates a fully self-contained diagnostic page (`versions.html`). This page allows end-users to generate a complete, copy-pasteable context report (file versions, browser, OS, execution environment) when submitting a bug report.

### ❓ The Problem
Because this project strictly adheres to a "no build tools, no server" philosophy, it is frequently distributed as raw files (e.g., downloaded ZIP archives without the `.git` history). Consequently, when a user reports a bug, maintainers have no way of knowing:
1. Which specific version of the project they are running.
2. Whether their local files are mixed, outdated, or manually edited.
3. What environment they are using (browser, OS, screen resolution).
4. How they opened the app (via double-clicking the local file, or hosted on a web server).

Without this context, debugging client-side issues relies heavily on guesswork.

### 🏗️ Proposed Architecture
The solution is divided into two distinct phases: **Development Time** (maintainer only) and **Runtime** (end-user only).

**1. Development Time: The Single Source of Truth & Stamping Tool**
*   **Central Manifest:** A single configuration file kept at the project root acts as the master record of the app version and the individual version of every project file.
*   **Line-One Banners:** A lightweight, optional Python script reads this manifest and "stamps" a standardized, single-line version banner at the very top of every HTML, CSS, and JS file.
*   **Runtime Registry Generation:** The same script automatically generates a small, static JavaScript file containing the entire version manifest. This is crucial because browsers block local files from reading other local files (due to CORS restrictions when opened via double-click). By embedding the data at stamp-time, the app requires no network requests or servers at runtime.
*   *Note:* The Python script is strictly a maintainer tool. End-users never need Python, and the distributed app remains 100% dependency-free.

**2. Runtime: The Diagnostic Page (`versions.html`)**
The stamping tool also generates a self-contained diagnostic page (with all styling and logic written inline, requiring zero external assets). This page provides:
*   **The Build Manifest:** A visual, archive-style ledger displaying the app version, the stamp date, and the version of every individual file in the project.
*   **Live Environment Detection:** Automatically detects and displays the user's browser and version, operating system, screen resolution, color-scheme preference, local storage availability, and whether the app was opened locally or via a web host.
*   **Runtime Integrity Check:** The page loads the app's generated runtime registry and compares it against its own stamped manifest. It displays a clear status badge:
    *   *Verified:* The code currently running perfectly matches the manifest.
    *   *Stale:* Files were modified without re-running the stamping tool.
    *   *Unverified:* The diagnostic page was moved outside the app's folder.
*   **One-Click Bug Report Export:** A button that compiles all the manifest and environment data into a neatly formatted Markdown block, ready to be copied to the clipboard or downloaded as a text file, and pasted directly into a new GitHub Issue.

### 🔄 The Workflow
1. **The Maintainer** finishes a feature, runs the stamping script with the new version number, and commits the updated files (including the regenerated diagnostic page).
2. **The User** encounters a bug, double-clicks the diagnostic page, verifies the "Verified" status, and clicks "Copy Report".
3. **The Issue** is submitted with a perfect, standardized snapshot of the user's exact build and environment.

### 🎯 Alignment with Project Philosophy
*   **Zero Friction:** Maintains the core promise of the project—users still only need a browser and a double-click.
*   **Offline-First:** The diagnostic page requires no internet connection and sends no telemetry anywhere; data is only shared if the user explicitly copies it.
*   **Security:** Continues the project's defense-in-depth approach by utilizing strict Content-Security-Policies, even within the generated diagnostic page.

### ✅ Acceptance Criteria
- [ ] A central version manifest exists at the project root.
- [ ] A stamping script successfully updates line-one banners across all project files.
- [ ] The script generates a static runtime registry and syncs the main app's version indicator.
- [ ] The script generates a fully self-contained `versions.html` inside the demo folder.
- [ ] The diagnostic page accurately displays file versions, live environment data, and an integrity check badge.
- [ ] The "Copy Report" feature successfully generates a valid Markdown context block to the clipboard.
- [ ] The entire diagnostic page functions perfectly when opened via double-click (local file protocol) without a server.
- [ ] The README is updated to instruct bug reporters to attach the generated context report.
