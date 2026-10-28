---
name: Forza 6 Randomizer
description: A garage you roll from. iOS grouped-list material where the only color is FH6 class colors and one system blue.
colors:
  ground: "#000000"
  surface: "#1c1c1e"
  surface-2: "#2c2c2e"
  surface-3: "#3a3a3c"
  separator: "rgba(84, 84, 88, 0.6)"
  text: "#ffffff"
  text-2: "#b4b4bb"
  text-3: "#a1a1a8"
  system-blue: "#0a84ff"
  accent-fill: "#0a6be0"
  accent-text: "#6cb4ff"
  accent-soft: "rgba(10, 132, 255, 0.18)"
  danger: "#ff6961"
  danger-fill: "#d1291f"
  on-accent: "#ffffff"
  scrim: "rgba(0, 0, 0, 0.5)"
  class-d: "#4fc1e9"
  class-c: "#f5c400"
  class-b: "#ff8a00"
  class-a: "#ff5a4f"
  class-s1: "#c77dff"
  class-s2: "#4b86ff"
  class-r: "#ff5fcf"
  class-x: "#30d158"
  class-ink: "#000000"
  pi-block: "#111111"
typography:
  large-title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "34px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  car-title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "26px"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.45
  subhead:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.4
  section-header:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    letterSpacing: "0.03em"
  class-badge:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "13px"
    fontWeight: 800
    lineHeight: 1
    fontFeature: "tnum"
  tab-label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "11px"
    fontWeight: 600
rounded:
  thumb: "6px"
  badge: "7px"
  sm: "8px"
  md: "12px"
  control: "14px"
  dialog: "16px"
  card: "22px"
spacing:
  xs: "6px"
  sm: "10px"
  md: "12px"
  lg: "14px"
  gutter: "16px"
  xl: "20px"
  tab-h: "56px"
components:
  button-primary:
    backgroundColor: "{colors.accent-fill}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.control}"
    height: "52px"
    width: "100%"
  button-primary-disabled:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.text-3}"
  button-secondary:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    height: "48px"
  text-button:
    textColor: "{colors.accent-text}"
    typography: "{typography.body}"
    height: "44px"
  filters-row:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "8px 12px 8px 14px"
    height: "52px"
  options-row:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    padding: "0 14px"
    height: "48px"
  field-input:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "0 14px"
    height: "48px"
  segmented:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.text-2}"
    rounded: "{rounded.sm}"
    padding: "2px"
  segmented-selected:
    backgroundColor: "{colors.surface-3}"
    textColor: "{colors.text}"
  roll-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.card}"
    padding: "14px 18px 18px"
  class-letter:
    backgroundColor: "{colors.class-c}"
    textColor: "{colors.class-ink}"
    typography: "{typography.class-badge}"
    rounded: "{rounded.badge}"
    padding: "5px 7px"
  pi-number:
    backgroundColor: "{colors.pi-block}"
    textColor: "{colors.on-accent}"
    typography: "{typography.class-badge}"
    padding: "5px 8px"
  toast:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
  sheet:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
  tab-bar-tab:
    textColor: "{colors.text-3}"
    typography: "{typography.tab-label}"
    height: "44px"
  tab-bar-tab-active:
    textColor: "{colors.accent-text}"
---

# Design System: Forza 6 Randomizer

## Overview

**Creative North Star: "The Garage Behind the Roll"**

The app is a native iOS app in a PWA's clothes. It uses true black ground, grouped surfaces in three tonal steps, hairline separators and SF system text. Nothing is decorated. The roll result is the one moment with weight: a rounded card with an uncropped car photo on a soft radial floor, the model name in bold, and the FH6 class badge below it. Everything else is a fast, plain list.

Color is rationed. The only hues on screen are the FH6 class colors, which identify a car's class just as the game's garage tiles do, and one system blue for actions. Dark mode is primary. Light mode mirrors it with iOS grouped-background values and keeps the same roles.

Density is iOS-standard: 17px body text, 44px minimum touch targets, 16px screen gutters, and a 640px max width so the layout stays a phone column on larger screens.

**Key Characteristics:**
- True black ground with #1c1c1e / #2c2c2e / #3a3a3c grouped surfaces and 0.5px separators.
- SF system type only, with large titles at 34px bold.
- Class colors and one blue are the only chroma.
- Car photos always show the whole car, in a 1340:752 frame.
- One signature motion: the roll reveal.

## Colors

A neutral iOS grouped-list palette with two sources of color: the FH6 class colors and one system blue.

### Primary
- **System Blue** (`system-blue`): focus rings, caret, checkbox accent. Always the iOS system blue.
- **Deep Action Blue** (`accent-fill`): the fill behind white labels. Used on the Roll button, the primary button, the toast action and the active-filter count pill. It is deeper than System Blue so white text clears 4.5:1 (5.0:1 dark, 5.8:1 light with #0062cc).
- **Link Blue** (`accent-text`): blue text on dark surfaces. Used for text buttons, the active tab, checkmarks and "on" filter values (7.8:1 on surface).
- **Blue Wash** (`accent-soft`): text selection and the install hint background.

### Secondary: FH6 Class Colors
The class letter block is always printed in Class Ink (`class-ink`, black) on its class color. Each pairing clears 4.5:1, and the lowest is S2 at 6.2:1.
- **D Cyan** (`class-d`), **C Yellow** (`class-c`), **B Orange** (`class-b`), **A Red** (`class-a`), **S1 Violet** (`class-s1`), **S2 Blue** (`class-s2`), **R Pink** (`class-r`), **X Green** (`class-x`).
- **PI Block** (`pi-block`): the near-black block joined to the class letter. It carries the PI number in white in both themes.

### Neutral
- **True Black** (`ground`): screen ground in dark mode. Light mode uses #f2f2f7.
- **Grouped Surface** (`surface`): groups, the roll card, sheets, the Filters row. Light mode uses #ffffff.
- **Raised Surface** (`surface-2`): fields, segmented track, option lists inside sheets, secondary buttons, toasts, alerts. Light mode uses #e9e9ee.
- **Top Surface** (`surface-3`): selected segment, avatar, sheet grabber. Light mode uses #d9d9de.
- **Hairline** (`separator`): 0.5px row dividers and the tab bar top edge. Light mode uses rgba(60, 60, 67, 0.29).
- **Primary Label** (`text`), **Secondary Label** (`text-2`, light #45454c), **Tertiary Label** (`text-3`, light #636369). Text-3 was raised to clear 4.5:1 on every surface. It is used for inactive tabs, chevrons, disabled labels and placeholders.
- **Destructive Red** (`danger`): destructive text, such as alert actions, Delete and field errors. It was raised for AA as text: 4.9:1 on surface-2 in dark mode, and #c40012 in light mode.
- **Destructive Fill** (`danger-fill`, `#d1291f`): the red behind white labels, for the Replace garage and Delete profile buttons and the swipe-row Delete. It gives white text 5.2:1. Never put white text on `danger`, which is a text color only.

### Named Rules
**The Two Sources Rule.** Chroma comes only from a class color or the action blue. No other hue enters the UI. Car photos are the only exception.

**The Fill Versus Text Rule.** Blue behind white text is `accent-fill`. Blue as text is `accent-text`. Never put white text on raw `system-blue`, and never put `accent-fill` text on a dark surface.

**The Black Letter Rule.** Class letters are always black on their class color. A new class color earns its place only if black text on it clears 4.5:1.

## Typography

**Display Font:** SF Pro via the system stack (`-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui`)
**Body Font:** the same system stack

**Character:** Native iOS text. The system face is this world's own material, not a fallback. Tabular numerals are on globally, so PI values and counts line up.

### Hierarchy
- **Large Title** (700, 34px, 1.1, -0.02em): one per tab screen ("Roll", "Garage", "Profiles") and on Welcome.
- **Car Title** (700, 26px, 1.15, -0.02em, balanced wrap): the rolled car's model. Empty-state titles use 22px bold.
- **Headline** (600, 17px): sheet titles, alert titles, list row names (17px profiles, 15px garage rows), button labels.
- **Body** (400, 17px, 1.45): inputs, option rows, lead text. Supporting copy runs 15–16px with a cap of 30–34ch.
- **Subhead** (400, 14px, 1.4): filter summary, the "N matching cars" count, the roll card's facts line (year · drivetrain · rarity · type · country).
- **Section Header** (400–600, 13px, uppercase, 0.03em, text-2): iOS grouped-list section headers and field labels. They sit above a group or a field, not above a heading.
- **Badge** (800, 13px, or 16px for the large badge): class letter and PI.
- **Tab Label** (600, 11px): the smallest functional text in the app.

### Named Rules
**The Eleven Point Floor Rule.** No functional text goes below 11px. Tab labels sit at that floor.

**The No Eyebrow Rule.** Headings stand alone. Never place a kicker or eyebrow label above a title. Uppercase 13px is reserved for iOS section headers on groups and fields.

## Layout

The app is a single phone column. Content has 16px side gutters and a 640px max width, centered. The bottom padding clears the 56px tab bar, the safe area and 24px more. Welcome narrows to 480px.

Roll is one fixed screen. In order: large title and avatar, segmented control (My Garage / All Cars), the Filters row, a flexible stage that holds the card, then a dock with the count and the full-width Roll button. The stage absorbs the leftover height, so the Roll button never moves and stays in the thumb zone.

Garage is a sectioned list with sticky uppercase section headers, 62px minimum rows and 68px photo thumbnails. Sheets take up to 88dvh, or 92dvh for the tall variant. Spacing steps in 6 / 10 / 12 / 14 / 16 / 20px, and 14px is the common gap between stacked blocks.

## Elevation & Depth

Depth is mostly tonal: ground, then surface, then surface-2, then surface-3. Shadows are reserved for the few things that float.

### Shadow Vocabulary
- **Card Lift** (`0 18px 40px rgba(0,0,0,0.55)` dark, `0 14px 30px rgba(0,0,0,0.14)` light): the roll card, alerts, toasts.
- **Blue Glow** (`0 10px 24px rgba(10,132,255,0.28)`): only under the enabled Roll button.
- **Segment Lift** (`0 2px 6px rgba(0,0,0,0.25)`): the selected segment.
- **Material Blur** (`saturate(180%) blur(20px)` over 82% ground): the tab bar.

### Named Rules
**The Tonal First Rule.** Separate things by surface step and hairline before reaching for a shadow. A shadow means the element floats above the list: the result, an alert or a toast.

## Shapes

Corners are continuous and soft. They grow with the element's size: 6px thumbs, 7–9px badges, 8px segments, 10px search and segmented track, 12px groups, fields and Filters row, 14px primary button, toasts and sheet tops, 16px alerts, 22px roll card. Round elements (avatar, icon buttons) are full circles. Groups clip their rows. Row dividers are 0.5px hairlines, never full borders.

### Named Rules
**The Whole Car Rule.** Car photos always render uncropped (`object-fit: contain`) inside a 1340:752 frame on the radial photo floor. This applies to the roll card hero and to garage thumbnails. Never crop a car to fill a box.

## Components

### Buttons
Plain and native.
- **Shape:** 14px corners on the primary button, 12px on secondary buttons.
- **Primary:** full width, 52px tall, Deep Action Blue fill, white 17px/600 label. Pressing scales it to 0.98. Disabled turns to surface-2 with text-3.
- **Secondary:** surface-2 fill, 48px, 17px/500. The destructive variant uses red text.
- **Text Button:** Link Blue text, 44px tall, no fill. Used for sheet header actions (Back, Clear All, and Done in 600 weight).
- **Focus:** a 2px System Blue outline at a 2px offset.

### Filters (signature)
Filters is a single 52px row on Grouped Surface: "Filters" in 17px/600, a one-line summary in 14px text-2 ("All cars" or the active values), an active-count pill in Deep Action Blue, and a chevron. Tapping it opens a sheet with a list of the seven filters. Each list row shows its current value, which turns Link Blue when set, plus a chevron. Tapping a row drills into its options in the iOS Settings pattern, with Back and Done in the sheet header. Option rows are 48px on surface-2 with hairline dividers, a count and a blue checkmark. Class options lead with a 12px swatch in the class color. This replaced the earlier wrapping chips.

### Class Badge (signature)
A class letter block joined to a PI block inside a 1.5px border in the class color (2px on the large badge). The letter is black on the class color, and the PI is white on #111. The small badge (13px) is used in lists. The large badge (16px, 9px radius) is used on the roll card.

### Roll Card and Reveal (signature)
The card has 22px corners, a Grouped Surface fill and Card Lift. It holds the 1340:752 photo on the radial floor, then the 26px model name, the large badge and an optional nickname, then the facts line.

The reveal is the app's one signature motion. The card springs in from scale 0.94, 18px lower and 10px blur (stiffness 380, damping 30, mass 0.9). The class badge then lands about 140ms later from scale 0.6 (stiffness 500, damping 22). A second tap interrupts and rerolls. Returning to the tab does not replay the reveal. With reduced motion, the reveal is a 0.2s opacity fade, and the badge appears without motion.

### Lists and Groups
Rows are 48–62px with 0.5px separators. A row has a leading thumb or swatch, a 15–17px/600 name with a 13–14px text-2 subline, and trailing values, checks or chevrons. Swipe rows reveal 76px Copy (#636366) and Delete actions.

### Inputs / Fields
Fields are 48px on surface-2 with 12px corners and 14px horizontal padding. They have a 13px uppercase label above and a 13px hint below. Focus shows a 2px blue outline with no offset. Errors turn the hint red. Search is 40px with 10px corners.

### Sheets, Alerts, Toasts
- **Sheet:** a bottom sheet (vaul) with a 14px top radius, a 36×5 grabber, and a three-column header (side action, centered 17px/600 title, side action) over a 50% scrim.
- **Alert:** 300px wide, 16px corners, surface-2, centered text, stacked full-width actions divided by hairlines. It pops in from scale 1.08 over 0.22s.
- **Toast:** bottom-center, above the Roll button (tab bar + safe area + 112px). It uses surface-2 material with a hairline border, 14px corners, Card Lift and 15px text, and stays 3.5s. Its action button uses Deep Action Blue.

### Navigation
A three-tab bar (Roll, Garage, Profiles) with 26px line icons and 11px/600 labels. Inactive tabs are text-3 and the active tab is Link Blue, with a 0.15s color change. The bar uses Material Blur and a hairline top edge. Each screen has a large-title header with a trailing avatar or icon button.

## Do's and Don'ts

### Do:
- **Do** print class letters in black on the class color. Check that any new class color clears 4.5:1.
- **Do** use `accent-fill` behind white labels and `accent-text` for blue text.
- **Do** show every car whole: 1340:752, `object-fit: contain`, on the radial photo floor.
- **Do** keep Filters as one row that opens a list and drills into options, iOS Settings style.
- **Do** keep the roll reveal as the only expressive motion. Use 0.15–0.22s ease-out (`cubic-bezier(0.22, 1, 0.36, 1)`) for state changes, and fall back to opacity under reduced motion.
- **Do** put toasts at the bottom, above the Roll button, in surface-2 material.
- **Do** keep touch targets at 44px or more and functional text at 11px or more.

### Don't:
- **Don't** put eyebrow or kicker labels above headings.
- **Don't** style a non-control, such as a label, a value or a static tag, as a fake button. Don't dress a control as something it isn't. Buttons look like iOS buttons, rows look like rows.
- **Don't** bring back wrapping filter chips.
- **Don't** add hues outside the class colors and the action blue.
- **Don't** crop car photos or use `object-fit: cover` on them.
- **Don't** add new motion signatures, such as page transitions, bouncing lists or parallax.
