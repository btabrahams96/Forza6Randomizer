# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React + TypeScript + Vite as an installable PWA, hosted on Cloudflare Pages. Bryton chose this ("A") over a native SwiftUI app and the B&B Eleventy starter. The libraries inside it were delegated: idb, zustand, vaul, sonner, motion, react-virtuoso, vite-plugin-pwa.

## Users

Two Forza Horizon 6 players, Bryton and Kyle, each on their own phone. Each keeps their own garage. They use the app sitting in front of the TV between events, phone in hand, controller nearby.

## Product Purpose

Pick a random car from your own FH6 garage for the next race or drag, narrowed by the same filters the game's garage uses. It works when the roll is quick, fair and honest about the class you actually built the car to.

## Positioning

The garage is yours: real cars you own, at the PI you upgraded them to, with duplicates allowed. Rolling across the whole game's car list is a secondary pool.

## Operating Context

- Players read a car's class and PI off the in-game garage tile and type it in when they upgrade.
- First setup is bulk: tick the cars you own from all 666 FH6 cars.
- Kyle's garage (193 cars) came in from photos of the TV screen, as a one-off import (`seed/kyle-garage.tsv`).
- There's no game API. Everything is entered by hand or imported.

## Capabilities and Constraints

- FH6 class bands: D 100–400, C 401–500, B 501–600, A 601–700, S1 701–800, S2 801–900, R 901–998, X 999.
- Filters follow FH5/FH6's garage: Class, Car Type, Manufacturer, Country, Rarity, Drivetrain (stock), Year.
- Data stays on the device. No accounts and no sync. A backup exports one profile at a time.
- Works offline once installed.
- Car data and photos come from the Forza Fandom wiki and are owned by Microsoft/Playground Games. Private use only.
- Full spec: `docs/superpowers/specs/2026-10-28-forza6-randomizer-design.md`.

## Brand Commitments

Working name "Forza 6 Randomizer". Bryton asked for it to feel "smooth and easy to use like an apple store app". There's no logo or palette, and no affiliation with Forza branding.

## Evidence on Hand

- Approved mockups: `.superpowers/brainstorm/57430-1793203401/content/core-screens.html` and `add-edit-flow.html`. Bryton said "love it".
- Real FH6 car photos come from the wiki through `npm run fetch-cars`.

## Product Principles

1. Rolling takes one tap from opening the app.
2. Classes and filters read exactly like the game.
3. Setting up and updating a garage is faster than writing it down.
4. Never lose a garage.

## Accessibility & Inclusion

WCAG AA contrast. Functional text at least 11px. Respect reduced motion. Touch targets at least 44pt.
