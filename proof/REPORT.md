# Proof report

Date: 2026-10-28
Build: `npm run build`, served with `vite preview` on port 4179, driven by playwright-cli (Chromium, light color scheme).
Data: a fresh profile with 3 cars added through the UI.

| Check | 375×812 | 768×1024 |
| --- | --- | --- |
| First launch shows the name picker; Someone else creates a profile | PASS | PASS |
| Picking Kyle on a fresh phone loads his 193 cars | PASS | PASS |
| Add 3 cars from the 665-car wiki list | PASS | PASS |
| Edit PI to 905, class badge shows R | PASS | PASS |
| Roll with Class R filter returns that car | PASS | PASS |
| Export backup downloads a JSON file | PASS | PASS |
| Import backup as a new profile (3 cars), original untouched | PASS | PASS |
| Offline: reload with network off, app loads and rolls | PASS | PASS |
| No horizontal page overflow | PASS | PASS |

Screenshots: `375-*.png` and `768-*.png` in this folder, numbered by step.

Also checked:
- Unit and component tests: `npx vitest run` gives 130/130.
- Offline precache: 678 entries, 3.2 MB. That covers the app shell, the catalog and every list thumbnail. Hero photos are cached the first time each one is shown.
- Dark mode, with Kyle's real 193-car garage, has captures in `375-dark-*.png` and `768-dark-*.png`. They cover:
  - every screen;
  - the empty and error states: zero matches, empty garage, no search results, an invalid PI, a bad import file;
  - a roll-reveal filmstrip, `375-dark-reveal-*`;
  - a second tap interrupting a roll, `375-dark-reveal-interrupt-*`.
- A closed sheet leaves the page: the import check asserts the Edit Profile sheet's field is gone before Import opens.

Not covered:
- A real iPhone. Safari's install flow and haptics can't be checked in Chromium.
- The share sheet. `navigator.share` with files isn't available in headless Chromium, so export fell back to a download.
- A desktop scroll video. This is a phone app with no long scrolling page.
