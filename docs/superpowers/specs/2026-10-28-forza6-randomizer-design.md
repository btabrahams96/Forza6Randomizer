# Forza 6 Randomizer: Design

Date: 2026-10-28
Owner: Bryton

## Intent

A phone app that picks a random car from your own Forza Horizon 6 garage for the next race or drag. Two players (Bryton and a friend) each keep their own garage on their own phone. Each car in the garage records the performance class and PI it is currently built to. Filters narrow the pool to what an event allows, then one tap rolls a car.

It must feel like a polished Apple App Store app: smooth, fast, native-feeling on a phone. The approved mockups (`.superpowers/brainstorm/*/content/core-screens.html` and `add-edit-flow.html`) set the layout and feel.

## Goals

- Roll a random car from my garage, filtered the same way FH6's in-game garage filters work.
- Keep a garage: add cars I own fast, then update a car's PI/class whenever I upgrade it.
- Car names, data and photos for every FH6 car come from the Forza wiki, so nobody types car data by hand.
- Feels native on iPhone: large titles, bottom sheets, swipe actions, spring motion, haptics where the platform allows.
- Works offline once installed.

## Non-goals

- No accounts, login, server or sync. Each phone holds its own data.
- No shared "room" or rolling for both players at once. Each player rolls on their own phone.
- No reading data from the game or Xbox. FH6 has no garage API; PI is entered by hand.
- No separate "race" and "drag" modes. Race vs drag is just whatever filters the player sets.
- No avoiding repeats. Every roll is fully random across the filtered pool.
- No saved tune/build history per car. An edit replaces the car's build.
- No public launch, SEO or marketing site.

## Anti-goals (would be a failure even if it works)

- Feels like a website in a browser: page reloads, tap delay, zoom on input focus, sticky hover, content under the notch.
- Setting up a 100+ car garage is a chore.
- A garage silently disappears.
- Classes or filters that don't match what the player sees in FH6.

## Constraints

- Platform: installable web app (PWA). Added to the home screen from Safari (iPhone) or Chrome (Android), runs standalone and full-screen.
- Hosting: free static hosting (Cloudflare Pages). One shared URL; each phone installs from it.
- Storage: on-device only (IndexedDB). Installed home-screen web apps on iOS keep their storage; the app still offers backup export/import (see below).
- Car photos are game screenshots owned by Microsoft/Playground Games, sourced from the Fandom wiki. Private use between two people only; don't promote the app publicly.
- The repo is empty. Start fresh.

## Approaches considered

| Approach | Trade-off | Verdict |
| --- | --- | --- |
| **A. Installable web app (React, PWA)** | Free; installs on both phones from a link, iPhone or Android; instant updates; can get very close to native feel but not identical. | **Picked.** Free, reaches both phones from one link, polish gets it close enough to native. |
| B. Native iPhone app (SwiftUI) | Most native feel. Needs Xcode; getting it on the friend's phone needs a $99/yr Apple developer account (TestFlight), or reinstalling every 7 days. iPhone only. | Rejected: cost and install friction for two people. |
| C. B&B Eleventy starter (per the kickoff doc) | Built for SEO marketing sites; this app would be almost all custom JS on top. | Rejected: wrong tool for an app. |

## Decisions made with Bryton

1. Users: Bryton and friend Kyle, each on their own phone, each with their own garage.
2. Data stays on the phone. No sync.
3. Filters match FH6's in-game garage filters, which Bryton confirmed are the same as FH5's.
4. The garage can hold several copies of the same car. Each copy has its own class, PI and optional nickname.
5. Editing a car replaces its build. No history of old builds.
6. Rolls are fully random. No repeat-avoidance.
7. Layout and flow: the three core screens and the add/edit flow from the mockups, which Bryton approved ("love it").
8. Adding cars: a searchable tick-list of all FH6 cars, added in bulk at their stock class. Adjust later by tapping a car.
9. Platform: approach A.
10. Drivetrain: no per-build drivetrain. The Drivetrain filter uses the car's stock layout from the wiki, even if a player swapped it in game ("let's not worry about drivetrain").

## Car data

### Source

Forza Fandom wiki, read through the MediaWiki API (`https://forza.fandom.com/api.php`). A plain page fetch returns HTTP 402; the API works.

- **Master list:** page `Forza_Horizon_6/Cars`, `action=parse&prop=wikitext`. 666 rows of `{{CarListStatsFH6|Name|DisplayName|Year|rarity|value|unlock|Sp|Ha|Ac|La|Br|Of|PI|country|...}}`, grouped under `<!-- Manufacturer -->` comments. Rarity codes: `c` Common, `r` Rare, `e` Epic, `l` Legendary, plus Barn Find, Treasure Car and Forza Edition variants (see `Template:CarListStatsFH6` for every code).
- **Per-car page** (the link target of the name): `{{CarInfobox}}` gives `layout` (engine position plus drivetrain, for example `ma` = mid-engine AWD) and the FH6 thumbnail filename (`FH6 <Name>.png` in the `<gallery>`). `{{CarStats|fh6 ...}}` gives `div = <code>`, the in-game car type (for example `msu` = Modern Supercars, `msp` = Modern Sports Cars, `cm` = Classic Muscle, `rra` = Retro Rally).
- **Photo URLs:** `action=query&titles=File:<name>&prop=imageinfo&iiprop=url`. Source images are 1340×752 PNG.

### Build-time pipeline

A script (`scripts/fetch-cars`) run by hand, not on every build:

1. Fetch the master list and parse every row.
2. For each car, fetch its page and pull `div`, `layout` and the FH6 thumbnail filename. Throttle requests and cache raw responses locally, so re-runs are cheap and polite.
3. Resolve each image URL, download it, and resize it to two WebP sizes (list thumb about 160px wide, hero card about 720px wide). Commit them into the app's static assets.
4. Write `cars.json`: id (slug), make, model, display name, year, country, rarity, value, unlock text, stock stats (Sp/Ha/Ac/La/Br/Of), stock PI, stock class, car type, drivetrain, engine position, image paths.
5. Print a report of anything missing (no page, no image, unknown `div` or `layout` code) and keep going. A car with no photo gets a neutral silhouette placeholder.

Re-run the script when the game adds cars. The app ships with that data, so it works fully offline.

### FH6 classes (not the FH5 ranges)

FH6 changed the class bands and added R. Source: wiki `Performance_Index` page, "Forza Horizon 6" column.

| Class | PI |
| --- | --- |
| D | 100–400 |
| C | 401–500 |
| B | 501–600 |
| A | 601–700 |
| S1 | 701–800 |
| S2 | 801–900 |
| R | 901–998 |
| X | 999 |

**The mockups used FH5 bands and are missing R.** The build uses the table above. Class is always derived from PI. Every garage entry always has a PI, because the in-game tile always shows class and PI (confirmed from Kyle's garage screenshots).

*Builder's call:* the class row in the edit sheet is a live read-out of the class the current PI falls in, not an input. The mockup's "tap a class if you don't know the exact PI" is dropped, because the PI is always visible on the in-game tile.

## Data model (on device)

- **Profile:** id, name, created date. A phone usually has one; the Profiles tab allows more for a shared phone.
- **Garage entry:** id, profileId, carId (from `cars.json`), pi (100–999), nickname (optional), added date, updated date. Class is computed from pi, never stored. Several entries can share a carId.
- **Roll settings per profile:** pool (My Garage / All Cars) and current filter selections, remembered between sessions.

### Backup

*Builder's call:*

- **Export:** one profile at a time. Profiles tab → profile → Export creates a JSON file (format version, profile name, entries of carId + pi + nickname) through the share sheet.
- **Import:** always asks where the file goes: "New profile" (the default) or "Replace <profile>". Replace needs a second confirmation naming the profile and its car count. Import never touches any other profile.
- The one-time screenshot seed file uses the same format, so seeding means importing it as a new profile.

## Screens

Tab bar: **Roll**, **Garage**, **Profiles**. iOS dark-mode look from the mockups; also support light mode via `prefers-color-scheme`.

### Roll

- Pool switch: My Garage / All Cars.
- Filter chips (below). Set chips show their value and an ✕ to clear.
- "1 of N matching cars" count updates live. Each garage entry is one ticket: two copies of the same car each roll separately (*builder's call*: they are different builds).
- Roll button. The result card shows the hero photo, make and year, model, class badge with PI, nickname, drivetrain and rarity.
- Zero matches: the button is disabled with a short message and a "Clear filters" action.

### Garage

- Large title, + button, search across make, model and nickname.
- Same filter chips plus Sort (Class default; also Make, Year, Recently updated).
- Grouped by class with counts.
- Row: thumb, name, nickname or car type, class badge.
- Tap opens the edit sheet. Swipe left shows Copy (duplicates the entry) and Delete (confirms, then a toast with Undo).
- Empty garage: one clear call to action that opens Add Cars.

### Add Cars (sheet from +)

- Search all FH6 cars, with filter chips.
- Row: thumb, name, year, car type, stock class/PI; "Own N" tag when already in the garage; tick circle.
- Bottom button "Add N cars" adds each ticked car at its stock PI. Ticking an owned car adds another copy.

### Edit Car (sheet)

- Hero photo, name.
- PI field with numeric keypad and −/+ stepper; the class badge updates live from PI.
- Class row: shows which class the PI falls in, read-only (see the classes section).
- Nickname.
- Duplicate and Delete.
- Stock data from the wiki, read-only: car type, stock class/PI, year, country.

### Profiles

- List of profiles on this phone; switch, add, rename, delete (confirm).
- Export / Import backup.
- About: data source credit to the Forza wiki.

## Filters

These are FH5's in-game garage filters, which Bryton says FH6 shares. Each is multi-select within itself (OR) and combines with the others (AND).

- **Class:** D, C, B, A, S1, S2, R, X. From current PI for garage cars, stock PI for All Cars.
- **Car Type:** from `div`.
- **Manufacturer**
- **Country**
- **Rarity**
- **Drivetrain:** FWD / RWD / AWD, from the stock `layout`. Swaps made in game are not tracked.
- **Year / era:** decade buckets.

FH5's exact filter list isn't documented anywhere I could find online. If Bryton spots a filter that's missing or named differently in game, add it then. The data has the fields for all of the above.

## Feel and polish

Applies the relevant parts of the B&B kickoff toolkit to an app, not a marketing site:

- `impeccable` writes PRODUCT.md and DESIGN.md from this doc and the mockups, and its hooks enforce that design system during the build.
- `apple-design` and `mobile-native` for sheets, swipe actions, safe areas, no input zoom, no tap highlight, no pull-to-refresh fighting scroll, standalone status bar.
- `emil-design-eng` / `animate` for the roll reveal (the one signature moment) and sheet and list motion. Everything respects `prefers-reduced-motion`.
- `break-ui` with worst-case data: long names (for example "Mercedes-AMG ONE"-length model names), 300+ car garages, empty garage, zero matches, missing photos.
- `playwright-cli` proof at 375 and 768 wide, with screenshots in `proof/`.
- Text contrast meets WCAG AA. Functional text is at least 11px. The mockups broke both; don't copy those values.

Skipped from the kickoff doc: Eleventy, `data-cms-*`, SEO scoring, Lenis, img2threejs. They're for marketing sites.

## Optional one-time seeding

If Bryton sends Xbox garage screenshots, Claude reads them and produces an import file that pre-fills Bryton's garage (car plus PI). This is a one-off, not an app feature.

**Kyle's garage is already transcribed:** `seed/kyle-garage.tsv`, 193 cars (columns: masterName, pi, classShown, tileText, photo, flag), matched to the wiki's car names. Turn it into an import file once `cars.json` ids exist. Known gaps:
- Photo IMG_7155 was never sent, so some S2 cars (roughly PI 808 to 845) are missing.
- Two edge-of-photo S2 tiles have no PI.
- One car isn't in the wiki list: "#33 BYP Racing Integra…" (2001 Honda, Epic). It's probably Time Attack DLC.
- One name is ambiguous: base 22B-STi vs 'Touge Edition'.

*Builder's call:* cars not in `cars.json` can be added by hand (make, model, year, PI) as a "custom car" with a placeholder photo. That keeps a DLC car missing from the wiki from blocking an import.

## Left to the builder

- Exact stack inside "React PWA": build tool, router, state store, IndexedDB wrapper, motion library, PWA/service-worker plugin.
- Roll reveal animation design, within the mockup's look.
- The full `div` and `layout` code-to-label tables (read them from the wiki templates).
- Placeholder art for cars without a photo.
- App icon and name on the home screen (working name "Forza 6 Randomizer").
- Cloudflare Pages project setup.
