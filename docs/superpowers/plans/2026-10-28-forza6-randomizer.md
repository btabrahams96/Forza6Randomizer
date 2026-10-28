# Forza 6 Randomizer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** An installable phone web app where each player keeps their own FH6 garage (car + current PI) and rolls a random car from it, filtered like FH6's in-game garage.

**Architecture:** Static React SPA, no backend. A one-off Node script pulls all FH6 cars from the Forza Fandom MediaWiki API into `src/data/cars.json` plus resized WebP photos in `public/cars/`. All user data lives in IndexedDB on the phone. Pure domain modules (classes, filters, roll, backup) hold the logic; React screens are thin.

**Tech Stack:** Vite + React 18 + TypeScript, Vitest + Testing Library + fake-indexeddb, `idb` (IndexedDB wrapper), `zustand` (state), `vaul` (iOS-style sheets), `sonner` (undo toasts), `motion` (springs), `react-virtuoso` (long lists), `vite-plugin-pwa` (manifest + service worker), `sharp` + `tsx` (fetch script). Hosted on Cloudflare Pages.

**Spec:** `docs/superpowers/specs/2026-10-28-forza6-randomizer-design.md`

## Global Constraints

- No accounts, server or sync. All user data on-device (IndexedDB).
- FH6 class bands, exactly: D 100–400, C 401–500, B 501–600, A 601–700, S1 701–800, S2 801–900, R 901–998, X 999. Class is always computed from PI, never stored.
- PI is an integer 100–999. Every garage entry always has one.
- Several garage entries may share a carId. Editing replaces the build; no history.
- Rolls are uniformly random over the filtered pool; each garage entry is one ticket. No repeat-avoidance.
- Filters: Class, Car Type, Manufacturer, Country, Rarity, Drivetrain (stock layout), Year (decade). Multi-select OR within a filter, AND across filters.
- Backup: one profile per file; import asks "New profile" (default) or "Replace <profile>", Replace needs a second confirm naming profile and car count; import never touches other profiles.
- Car data source is `https://forza.fandom.com/api.php` (plain page fetch returns 402). Throttle and cache requests.
- WCAG AA text contrast; functional text ≥ 11px. Respect `prefers-reduced-motion`. Dark mode is primary; light mode via `prefers-color-scheme`.
- Works offline once installed.
- Private use only; About screen credits the Forza wiki.

## Review Focus

1. **PI input garbage:** empty, `0`, `99`, `1000`, `7.5`, `abc`, pasted spaces. Expect the field to refuse to save outside 100–999 integers and show why, never store a bad PI. Test in Task 2 (`parsePi`) and Task 9 (edit sheet save disabled).
2. **Car ids must stay stable across re-fetches.** Garages reference `carId`; if a re-run renames ids, every garage breaks. Expect ids derived only from the wiki name plus edition suffix, deterministic, and entries whose carId is no longer in `cars.json` to render as "Unknown car" instead of crashing. Tests in Task 3 (`makeCarIds` stable and unique) and Task 9 (unknown carId row).
3. **Bad backup files:** not JSON, wrong `version`, a file from another app, unknown carIds, entries with bad PI. Expect a clear error or a "N skipped" summary and zero changes to existing profiles. Tests in Task 6.
4. **Duplicate wiki names:** the list has 6 duplicated names (Forza Edition, Welcome Pack variants). Expect each to get its own id and label. Test in Task 3.
5. **Zero matches / empty garage on Roll:** expect a disabled Roll button with a "Clear filters" action, never a crash or a blank card. Test in Task 5 (`roll([])` returns `null`) and Task 10.

---

## File Structure

```
scripts/
  lib/wiki.ts           parse wikitext (list rows, car page fields), pure
  lib/ids.ts            stable car ids
  fetch-cars.ts         network + cache + images + writes cars.json
  seed-from-tsv.ts      seed/kyle-garage.tsv -> seed/kyle-garage.json (backup format)
src/
  domain/classes.ts     class bands, classForPi, parsePi
  domain/labels.ts      code -> label maps (division, layout, rarity, country)
  domain/types.ts       Car, CustomCar, Profile, GarageEntry, FilterState, BackupFile
  domain/filters.ts     applyFilters, facetOptions, decade
  domain/roll.ts        roll
  domain/backup.ts      buildBackup, parseBackup
  data/cars.json        generated
  data/catalog.ts       loads cars.json, getCar(id)
  storage/db.ts         IndexedDB schema + CRUD
  state/store.ts        zustand store over db
  ui/tokens.css         design tokens
  ui/ClassBadge.tsx  ui/CarThumb.tsx  ui/FilterChips.tsx  ui/TabBar.tsx
  screens/RollScreen.tsx  screens/GarageScreen.tsx  screens/AddCarsSheet.tsx
  screens/EditCarSheet.tsx  screens/ProfilesScreen.tsx  screens/ImportFlow.tsx
  App.tsx  main.tsx
public/cars/<id>-160.webp, <id>-720.webp, placeholder.svg
tests/ mirrors src/ and scripts/
```

---

### Task 1: Scaffold

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `tests/smoke.test.tsx`, `vitest.setup.ts`
- Modify: `.gitignore` (add `node_modules/`, `dist/`, `.cache/`)

**Interfaces:**
- Produces: `npm run dev`, `npm test` (`vitest run`), `npm run build`, `npm run fetch-cars` (`tsx scripts/fetch-cars.ts`), `npm run seed` (`tsx scripts/seed-from-tsv.ts`).

- [ ] **Step 1:** `npm create vite@latest . -- --template react-ts`, then install the Tech Stack deps (dev: vitest, @testing-library/react, @testing-library/jest-dom, jsdom, fake-indexeddb, tsx, sharp).
- [ ] **Step 2:** Write `tests/smoke.test.tsx`: renders `<App />` and expects text `Roll`. Vitest env `jsdom`, setup file imports `@testing-library/jest-dom` and `fake-indexeddb/auto`.
- [ ] **Step 3:** Run `npm test`. Expected: PASS once `App` renders a placeholder containing "Roll".
- [ ] **Step 4:** Commit the spec, `seed/kyle-garage.tsv`, `.gitignore` and the scaffold: `git commit -m "chore: scaffold vite react app with spec and Kyle seed"`.

### Task 2: Classes and PI

**Files:**
- Create: `src/domain/classes.ts`, `tests/domain/classes.test.ts`

**Interfaces:**
- Produces: `type ClassId = 'D'|'C'|'B'|'A'|'S1'|'S2'|'R'|'X'`; `CLASS_ORDER: ClassId[]`; `CLASS_BANDS: Record<ClassId, {min:number,max:number}>`; `classForPi(pi: number): ClassId` (throws `RangeError` outside 100–999 or non-integer); `parsePi(input: string): {ok:true, pi:number} | {ok:false, reason:'empty'|'not-a-number'|'out-of-range'}`.

- [ ] **Step 1: Failing tests:**
  `classForPi`: 100→D, 400→D, 401→C, 500→C, 501→B, 600→B, 601→A, 700→A, 701→S1, 800→S1, 801→S2, 900→S2, 901→R, 998→R, 999→X; 99, 1000, 7.5 throw `RangeError`.
  `parsePi`: `''`→empty, `'  '`→empty, `'abc'`→not-a-number, `'7.5'`→not-a-number, `'99'`→out-of-range, `'1000'`→out-of-range, `' 701 '`→`{ok:true, pi:701}`.
- [ ] **Step 2:** `npx vitest run tests/domain/classes.test.ts` → FAIL (module missing).
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Re-run → PASS.
- [ ] **Step 5:** `git commit -m "feat: FH6 class bands and PI parsing"`.

### Task 3: Wiki parsing and stable ids

**Files:**
- Create: `scripts/lib/wiki.ts`, `scripts/lib/ids.ts`, `src/domain/labels.ts`, `src/domain/types.ts`, `tests/scripts/wiki.test.ts`, `tests/scripts/ids.test.ts`, `tests/fixtures/list-snippet.txt`, `tests/fixtures/page-acura-nsx.txt`

**Interfaces:**
- Produces in `src/domain/types.ts`:
  `Car = {id:string; name:string; make:string; model:string; year:number; country:string; rarity:Rarity; value:number; unlock:string; stats:{sp:number;ha:number;ac:number;la:number;br:number;of:number}; stockPi:number; carType:string|null; drivetrain:'FWD'|'RWD'|'AWD'|null; engine:'Front'|'Mid'|'Rear'|null; thumb:string|null; hero:string|null}`
  `Rarity = 'Common'|'Rare'|'Epic'|'Legendary'|'Forza Edition'|'Barn Find'|'Treasure Car'`
- `parseCarList(wikitext: string): RawListRow[]` where `RawListRow = {name:string; display:string|null; year:number; rarityCode:string; value:number; unlockCode:string; stats:number[6]; pi:number; country:string; extra:Record<string,string>; make:string}` (make = the most recent `<!-- Make -->` comment).
- `parseCarPage(wikitext: string): {div:string|null; layout:string|null; imageFile:string|null}` (`div` from the `{{CarStats|fh6 …}}` block only; `imageFile` = first `FH6 …png|jpg` in the infobox gallery).
- `makeCarIds(rows: RawListRow[]): string[]` — slug of `name`, plus `-forza-edition` when `rarityCode==='fe'`, plus `-welcome-pack` when `unlockCode==='wp'`, then `-2`, `-3` for any remaining collisions in list order. Lowercase ASCII, accents stripped, non-alphanumerics → `-`.
- `labels.ts`: `RARITY_BY_CODE`, `DIVISION_LABELS: Record<string,string>`, `drivetrainFromLayout(code:string|null)`, `engineFromLayout(code:string|null)`, `COUNTRY_LABELS`. Fill `DIVISION_LABELS` and the layout tables by reading the wiki templates that render `div` and `layout` (fetch `Template:CarStats` and `Template:CarInfobox` wikitext via the API and transcribe their `#switch` tables). Known samples: `msu` Modern Supercars, `msp` Modern Sports Cars, `cm` Classic Muscle, `rra` Retro Rally, `ma` = Mid-engine AWD.

- [ ] **Step 1:** Save fixtures: the first 20 `{{CarListStatsFH6…}}` lines of the live list including the `<!-- Abarth -->`/`<!-- Acura -->` comments and the `Acura NSX Type S … |band = Blue` row, plus two rows sharing a name (one `fe`). Save the Acura NSX Type S page wikitext.
- [ ] **Step 2: Failing tests:** `parseCarList` on the fixture returns `{name:'Abarth 124 Spider', make:'Abarth', year:2017, rarityCode:'r', value:250000, pi:450, country:'ita'}` for row 0 and `extra.band==='Blue'` for the NSX; `parseCarPage` on the NSX gives `{div:'msu', layout:'ma', imageFile:'FH6 Acura NSX Type-S.png'}`; `makeCarIds` returns unique ids, gives the `fe` twin `…-forza-edition`, and returns identical output on two calls and on reversed-then-restored input order for non-colliding rows; `drivetrainFromLayout('ma')==='AWD'`; `RARITY_BY_CODE.barn==='Barn Find'`.
- [ ] **Step 3:** Run → FAIL. **Step 4:** Implement. **Step 5:** Run → PASS.
- [ ] **Step 6:** `git commit -m "feat: wiki parsers, car ids and label tables"`.

### Task 4: Fetch script and catalog

**Files:**
- Create: `scripts/fetch-cars.ts`, `src/data/catalog.ts`, `public/cars/placeholder.svg`, `tests/data/catalog.test.ts`
- Generated (commit): `src/data/cars.json`, `public/cars/*.webp`

**Interfaces:**
- Consumes: Task 3 parsers, ids, labels.
- Produces: `cars.json` as `Car[]` sorted by make then model; `catalog.ts`: `CARS: Car[]`, `getCar(id:string): Car|undefined`, `carImage(car: Car|undefined, size:'thumb'|'hero'): string` (falls back to `/cars/placeholder.svg`).

- [ ] **Step 1:** Implement `fetch-cars.ts`: User-Agent `Forza6Randomizer/1.0 (private use)`; cache each API response to `.cache/wiki/<sha1(url)>.json` and reuse it unless `--refresh`; at most 2 requests/second; fetch the list, then each car page (`action=parse&prop=wikitext&redirects=1&page=<name>`), then image URLs in batches of 50 titles (`action=query&prop=imageinfo&iiprop=url`); resize with sharp to 160px and 720px wide WebP (quality 80) into `public/cars/<id>-160.webp` / `-720.webp`; write `cars.json`; print a summary: total, missing page, missing image, unknown div, unknown layout.
- [ ] **Step 2:** Run `npm run fetch-cars`. Expected: 666 cars written; missing-image and unknown-code counts printed. Add any unknown `div`/`layout` codes to `labels.ts` and re-run (cache makes it fast) until unknown counts are 0 or each remaining one is listed in the commit message.
- [ ] **Step 3: Test** `tests/data/catalog.test.ts`: `CARS.length >= 660`; every id unique; every `stockPi` passes `classForPi` without throwing; `getCar('acura-nsx-type-s')?.carType === 'Modern Supercars'`; `carImage(undefined,'thumb')` is the placeholder.
- [ ] **Step 4:** `npx vitest run tests/data` → PASS.
- [ ] **Step 5:** `git commit -m "feat: fetch FH6 car catalog and photos from the wiki"`.

### Task 5: Filters and roll

**Files:**
- Create: `src/domain/filters.ts`, `src/domain/roll.ts`, `tests/domain/filters.test.ts`, `tests/domain/roll.test.ts`

**Interfaces:**
- `FilterKey = 'class'|'carType'|'make'|'country'|'rarity'|'drivetrain'|'decade'`; `FilterState = Partial<Record<FilterKey, string[]>>`.
- `RollItem = {key:string; car:Car|undefined; custom:CustomCar|null; pi:number; nickname:string|null; entryId:string|null}` (garage item: entry's PI; All Cars item: stock PI, `entryId:null`). `CustomCar` is defined in Task 6's types; add it to `types.ts` here if Task 6 hasn't run yet. For custom entries, `make` and `decade` come from `custom`; the other car-based filters read null.
- `decade(year:number): string` (`1968`→`'1960s'`).
- `valueFor(item: RollItem, key: FilterKey): string|null` (class via `classForPi(item.pi)`).
- `applyFilters(items: RollItem[], f: FilterState): RollItem[]`.
- `facetOptions(items: RollItem[], key: FilterKey): {value:string; count:number}[]` (class sorted by `CLASS_ORDER`, decade ascending, others A–Z).
- `roll(pool: RollItem[], rng: () => number = Math.random): RollItem|null`.

- [ ] **Step 1: Failing tests:** two entries of the same car at PI 700 and 900 → `class:['A']` keeps only the first; `class:['A','S2']` keeps both (OR); `class:['A'], make:['Toyota']` ANDs; empty arrays are ignored; an item with `car: undefined` passes only when no car-based filter is set; `facetOptions(...,'class')` orders D before X; `roll([])===null`; `roll(pool, () => 0)` is `pool[0]`, `() => 0.9999` is the last item.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement. **Step 4:** Run → PASS.
- [ ] **Step 5:** `git commit -m "feat: FH-style filters and uniform roll"`.

### Task 6: Storage, store and backup

**Files:**
- Create: `src/storage/db.ts`, `src/state/store.ts`, `src/domain/backup.ts`, `tests/storage/db.test.ts`, `tests/domain/backup.test.ts`
- Modify: `src/domain/types.ts`

**Interfaces:**
- Types: `Profile = {id; name; createdAt:number}`; `CustomCar = {make:string; model:string; year:number|null}`; `GarageEntry = {id; profileId; carId:string|null; custom:CustomCar|null; pi:number; nickname:string|null; addedAt:number; updatedAt:number}` (exactly one of carId/custom set); `RollSettings = {profileId; pool:'garage'|'all'; filters:FilterState}`.
- `db.ts` (`idb`, db name `f6r`, version 1, stores `profiles`, `entries` with index `byProfile`, `settings`, `meta`): `listProfiles()`, `createProfile(name)`, `renameProfile(id,name)`, `deleteProfile(id)` (deletes its entries + settings), `listEntries(profileId)`, `addEntries(profileId, carIds:string[])` (each at the car's `stockPi`), `addCustomEntry(profileId, custom, pi)`, `updateEntry(id, {pi?, nickname?})` (validates PI with `classForPi`), `duplicateEntry(id)`, `deleteEntry(id): Promise<GarageEntry>`, `restoreEntry(entry)`, `getSettings(profileId)`, `saveSettings(s)`, `getActiveProfileId()`, `setActiveProfileId(id)`, `replaceEntries(profileId, entries)`.
- On first open call `navigator.storage?.persist?.()`.
- `store.ts`: zustand store mirroring active profile, its entries and settings, with actions wrapping the db calls.
- `backup.ts`: `BackupFile = {app:'forza6-randomizer'; version:1; profileName:string; exportedAt:string; entries:{carId:string|null; custom:CustomCar|null; pi:number; nickname:string|null}[]}`; `buildBackup(profile, entries): BackupFile`; `parseBackup(text:string, knownCarIds:Set<string>): {ok:true; file:BackupFile; skipped:{index:number; reason:string}[]} | {ok:false; error:'not-json'|'wrong-app'|'unsupported-version'|'no-entries'}`. Entries with an unknown carId become `custom` with make/model `Unknown`, model = the carId; entries with invalid PI are skipped.

- [ ] **Step 1: Failing tests (db):** `addEntries(p,['x','x'])` creates two entries; `updateEntry(id,{pi:1000})` rejects and leaves the entry unchanged; `deleteProfile(a)` leaves profile b's entries intact; `deleteEntry` + `restoreEntry` round-trips; `replaceEntries(a, …)` doesn't touch b.
- [ ] **Step 2: Failing tests (backup):** round-trip `buildBackup`→`JSON.stringify`→`parseBackup` equals input; `'nope'`→`not-json`; `{app:'other'}`→`wrong-app`; `version:2`→`unsupported-version`; an entry with `pi:50` is in `skipped`; unknown carId comes back as custom.
- [ ] **Step 3:** Run → FAIL. **Step 4:** Implement. **Step 5:** Run → PASS.
- [ ] **Step 6:** `git commit -m "feat: on-device storage, store and backup format"`.

### Task 7: Kyle seed file

**Files:**
- Create: `scripts/seed-from-tsv.ts`, `tests/scripts/seed.test.ts`
- Generated (commit): `seed/kyle-garage.json`

**Interfaces:**
- Consumes: `CARS`, `buildBackup`-compatible `BackupFile`.
- `tsvToBackup(tsv:string, cars:Car[], profileName:string): {file: BackupFile; notes:string[]}` — match `masterName` to `Car.name`; matched with PI → entry; blank PI → stock PI and nickname `Check PI`; no match → custom entry from `tileText` (`MODEL / YEAR MAKE / RARITY`) at the given PI, nickname `Check car`. `notes` lists each fallback.

- [ ] **Step 1: Failing test:** a 3-row TSV (matched, blank PI, no match) yields 3 entries with those nicknames and 2 notes.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement + CLI wrapper writing `seed/kyle-garage.json` (profile name `Kyle`). **Step 4:** Run → PASS; `npm run seed` reports 193 entries.
- [ ] **Step 5:** `git commit -m "feat: Kyle garage seed import file"`.

### Task 8: Design system and app shell

**Files:**
- Create: `src/ui/tokens.css`, `src/ui/ClassBadge.tsx`, `src/ui/CarThumb.tsx`, `src/ui/TabBar.tsx`, `src/ui/FilterChips.tsx`, `PRODUCT.md`, `DESIGN.md`, `tests/ui/ClassBadge.test.tsx`
- Modify: `index.html`, `src/App.tsx`, `src/main.tsx`

**Interfaces:**
- `<ClassBadge pi={number} />` renders class letter + PI. Class colors: D `#4fc1e9`, C `#f5c400`, B `#ff8a00`, A `#ff453a`, S1 `#bf5af2`, S2 `#2f6fed`, R (pick a distinct hue and record it in DESIGN.md), X `#30d158`, with a dark letter on the color and ≥ 4.5:1 contrast.
- `<CarThumb car size />` uses `carImage`, `loading="lazy"`, fixed aspect ratio (1340:752).
- `<FilterChips items filters onChange keys />`: one chip per FilterKey; tapping opens a sheet listing `facetOptions` with counts and checkmarks; set chips show the value(s) and an ✕.
- `<TabBar active onChange />`: Roll, Garage, Profiles.

- [ ] **Step 1:** Run `/impeccable init` and write PRODUCT.md and DESIGN.md from the spec and the approved mockups (`.superpowers/brainstorm/*/content/core-screens.html`, `add-edit-flow.html`). Fix their contrast and the 10px text, and use the FH6 bands.
- [ ] **Step 2:** Apply the `mobile-native` and `apple-design` basics: viewport-fit=cover + safe-area padding, `-webkit-tap-highlight-color: transparent`, inputs ≥ 16px, `overscroll-behavior: none` on the root, `100dvh`, `apple-mobile-web-app-status-bar-style` black-translucent, no hover styles on touch.
- [ ] **Step 3: Failing test:** `<ClassBadge pi={901}/>` shows `R` and `901`; `pi={700}` shows `A`.
- [ ] **Step 4:** Implement the components + App shell with tab switching. Run tests → PASS.
- [ ] **Step 5:** `git commit -m "feat: design tokens, shell and shared components"`.

### Task 9: Garage, Add Cars and Edit Car

**Files:**
- Create: `src/screens/GarageScreen.tsx`, `src/screens/AddCarsSheet.tsx`, `src/screens/EditCarSheet.tsx`, `tests/screens/garage.test.tsx`

**Interfaces:**
- Consumes: store (Task 6), FilterChips/ClassBadge/CarThumb (Task 8), `parsePi`, `applyFilters`.
- Garage: large title, +, search (make, model, nickname, case- and accent-insensitive), chips, Sort (Class default, Make, Year, Recently updated), sections by class with counts, rows via `react-virtuoso`. Tap → EditCarSheet. Swipe left → Copy / Delete; Delete confirms, then a `sonner` toast with Undo (`restoreEntry`). An entry with an unknown carId shows "Unknown car" + placeholder. Empty state: one button that opens Add Cars.
- AddCarsSheet (`vaul`): search all `CARS`, chips, rows with "Own N" tag and tick, bottom button `Add N cars` (disabled at 0), and an "Add a car that's not listed" row opening a small custom-car form (make, model, year optional, PI).
- EditCarSheet: hero photo, name, PI field (`inputmode="numeric"`) with −/+ stepper (clamped 100–999), live ClassBadge, read-only class row, nickname, Duplicate, Delete, stock data (car type, stock class/PI, year, country). Save is disabled and the reason shown when `parsePi` fails.

- [ ] **Step 1: Failing tests:** adding 2 ticked cars shows 2 rows; editing PI to `701` moves the row under "S1"; typing `1000` disables Save and shows the out-of-range message; Delete then Undo restores the row; a seeded entry with carId `gone` renders "Unknown car".
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement. **Step 4:** Run → PASS.
- [ ] **Step 5:** Run `break-ui` on Garage and Edit with worst-case data (a 300-entry garage, the longest names in `cars.json`, an empty garage, missing photos). Fix what breaks.
- [ ] **Step 6:** `git commit -m "feat: garage, add cars and edit car sheets"`.

### Task 10: Roll screen

**Files:**
- Create: `src/screens/RollScreen.tsx`, `tests/screens/roll.test.tsx`

**Interfaces:**
- Consumes: store settings (pool + filters, saved per profile on change), `applyFilters`, `roll`, `facetOptions`.
- Segmented My Garage / All Cars; chips; live "N matching cars"; Roll button; result card (hero, make · year, model, ClassBadge, nickname, drivetrain, rarity). Zero matches → disabled Roll, message and a "Clear filters" button. The reveal is the one signature animation: use `animate`/`emil-design-eng` to design it (short spring, ≤ 600 ms, interruptible by a second tap), with a crossfade under `prefers-reduced-motion`. Haptic via `navigator.vibrate?.(10)` where supported.

- [ ] **Step 1: Failing tests:** with `rng` injected via a prop or context, Roll shows the expected car; with filters matching nothing, the button is disabled and "Clear filters" resets them; reloading the screen keeps the saved pool and filters.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement. **Step 4:** Run → PASS.
- [ ] **Step 5:** `git commit -m "feat: roll screen with reveal"`.

### Task 11: Profiles, export and import

**Files:**
- Create: `src/screens/ProfilesScreen.tsx`, `src/screens/ImportFlow.tsx`, `tests/screens/profiles.test.tsx`

**Interfaces:**
- Consumes: db profile functions, `buildBackup`, `parseBackup`, `replaceEntries`.
- Profiles list with active check; add, rename, delete (confirm naming the car count). First launch with no profiles asks for a name.
- Export: `navigator.share({files:[File]})` when `navigator.canShare` allows files, else download `<name>-garage.json`.
- Import: file picker → `parseBackup` → error screen, or a choice between "New profile" (default, prefilled with `profileName`) and "Replace <profile>" → a second confirm for Replace ("Replace Kyle's 193 cars?") → summary "Imported N, skipped M".
- About: credit "Car data and images: Forza Wiki (forza.fandom.com)".

- [ ] **Step 1: Failing tests:** importing `seed/kyle-garage.json` as a new profile creates "Kyle" with 193 entries and leaves the existing profile untouched; Replace requires both confirms; a `not-json` file shows the error and changes nothing.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement. **Step 4:** Run → PASS.
- [ ] **Step 5:** `git commit -m "feat: profiles with backup export and import"`.

### Task 12: PWA, offline and proof

**Files:**
- Modify: `vite.config.ts`
- Create: `public/icons/*` (192, 512, maskable, apple-touch-icon 180), `proof/REPORT.md`, `proof/*.png`

**Interfaces:**
- `vite-plugin-pwa` with `registerType: 'autoUpdate'`, manifest `name: 'Forza 6 Randomizer'`, `short_name: 'F6 Roll'`, `display: 'standalone'`, dark `theme_color`/`background_color`. Precache the app shell, `cars.json` and all `-160.webp` thumbs. Hero images use runtime `CacheFirst`; offline with no cached hero, the card falls back to the thumb.

- [ ] **Step 1:** Configure and `npm run build`. Expected: the build succeeds; the precache size is printed (target < 15 MB).
- [ ] **Step 2:** Run `/impeccable critique` and `/impeccable polish`, then `review-animations`. Fix material findings.
- [ ] **Step 3:** Playwright proof (`playwright-cli`) against `npm run preview` at 375×812 and 768×1024: create a profile, add 3 cars, edit one PI to 905 (shows R), roll with Class R (gets that car), export, import as new profile, then go offline and reload (the app still loads and rolls). Save screenshots to `proof/` and write pass/fail per check in `proof/REPORT.md`.
- [ ] **Step 4:** `git commit -m "feat: installable offline PWA with proof"`.
- [ ] **Step 5:** Deploy: this needs Bryton's Cloudflare login (`npx wrangler login`, run by Bryton), then `npx wrangler pages deploy dist --project-name forza6-randomizer`. Hand Bryton the URL and the Add to Home Screen steps.
