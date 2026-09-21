# LFAS · LIFT Facial Aging Scale

A standalone, iPad-first scoring web app based on the supplied LFAS sheet. It includes all 27 signs in the four morphological domains, six separate functional modifiers, live scoring, mixed-pattern handling, Reset Assessment, and EMR-ready Copy Results.

## Deploy to Vercel

1. Unzip the project. Put the contents of the `lfas-app` folder in a GitHub repository (keep `public`, `tests`, `package.json`, and `vercel.json` at the repository root).
2. In Vercel, choose **Add New → Project** and import that repository.
3. Use **Other** as the Framework Preset. Set **Output Directory** to `public`. Leave **Build Command** and **Install Command** empty. The included `vercel.json` supplies these settings. No environment variables or database are needed.
4. Select **Deploy** and open the generated HTTPS address. Score an assessment and test Copy Results.
5. In the project’s **Settings → Domains**, add `app.liftmedicalesthetics.com`.
6. At the DNS provider currently hosting your domain’s DNS (GoDaddy if your nameservers point there), add a **CNAME** record named `app`, with the **exact target Vercel displays**. Avoid guessing the CNAME target. Replace any conflicting record for `app` only; leave your main website and mail records unchanged.
7. Wait for Vercel to report the domain as configured and its HTTPS certificate as ready.

Official references: [Vercel static build configuration](https://vercel.com/docs/builds/configure-a-build), [custom domains](https://vercel.com/docs/domains/working-with-domains/add-a-domain). Choose a Vercel plan appropriate to practice/business use; review current terms and pricing during account setup.

This delivery contains deployable files; it has not been published to Vercel or connected to your domain.

## Add to iPad Home Screen

Open the deployed HTTPS address in Safari. Choose **Share → Add to Home Screen → Add**. The LFAS icon launches the app in standalone mode. Open it online once before using it offline, allowing the app files to finish loading. Confirm offline reopening on your actual iPad before relying on it.

## Use

- Tap 0–4 for each sign. Controls are at least 44 × 44 CSS pixels.
- Blank means **unassessed**, not absent. Tap **0** explicitly for absent signs.
- Domain averages update immediately. Partially answered domains are marked **provisional** and average only answered signs.
- Overall LFAS, driver classification, and Copy Results become available after all 27 signs are answered.
- Answer functional modifiers Yes/No separately. They do not alter scores. Unanswered functional modifiers are identified as unassessed in copied text.
- Copy Results and paste into the EMR. If the browser blocks automatic copying, the app shows selectable text for manual copying.
- Reset Assessment opens a confirmation. Copy any results you need before resetting or leaving the page.

## Calculation rules

1. Each complete domain is the sum of its sign scores divided by its sign count: 8, 7, 6, 6. Round each mean to one decimal.
2. Overall LFAS is the arithmetic mean of the **four rounded, displayed domain means**, rounded to one decimal. Every domain has equal weight, regardless of sign count.
3. Driver comparisons use these displayed domain means. A unique highest score is primary unless another domain is within **0.5 points inclusive**.
4. Mixed Pattern means all domains within 0.5 of the highest share the leading group. The app names that group as primary and reports **no separate secondary driver**, avoiding a forced ranking inside the group. The threshold is measured from the highest score, not chained between adjacent scores.
5. Outside a mixed pattern, the second-highest positive domain is secondary. Exact ties for secondary are listed together. Lower domains merely being close to one another do not override a clearly dominant highest domain.
6. All-zero scores produce no driver. Zero-score remaining domains do not become secondary drivers.

The sheet’s “within 0.5 / no dominant domain” wording leaves grouping details open; points 3–6 are the explicit implementation interpretation, also explained inside the app.

## Privacy and persistence

No patient identifiers, photos, database, analytics, external fonts, AI calls, or external API connections. Scores are held only in page memory. Refreshing/closing the page clears them; navigation history restoration may retain a live page, so use Reset Assessment between patients. Copy Results writes to the device clipboard only when requested. The EMR and device clipboard are outside this app’s storage boundary.

The service worker caches only the public application files for offline use. It never caches assessment inputs. A PWA browser may discard a backgrounded page, so copy important results promptly.

## Local preview and tests

Install Node.js 20 or later. No package installation is required.

```sh
npm start
```

Open `http://127.0.0.1:4173`. Use a server rather than double-clicking `index.html`; JavaScript modules and service workers require an appropriate web origin.

```sh
npm test
```

See `TESTING.md` for executed checks and remaining device checks.

## Files and updates

- `public/index.html`: app shell and explanatory copy
- `public/styles.css`: LIFT navy, blue domains, gold functional panel, responsive layout
- `public/scoring.js`: source-of-truth signs and deterministic scoring/export logic
- `public/app.js`: touch, keyboard, reset, and clipboard behavior
- `public/sw.js`: offline app-shell cache
- `public/manifest.webmanifest` and `public/icons/`: home-screen support
- `vercel.json`: deployment and security headers
- `server.mjs`: dependency-free local preview
- `tests/`: built-in Node test runner tests

When changing any app file, increment the `CACHE` name in `public/sw.js` before redeploying. Updates wait until existing app pages close so they do not interrupt an active assessment. Close all LFAS windows and reopen online to load an update.
