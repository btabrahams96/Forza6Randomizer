# Forza 6 Randomizer

A phone app that rolls a random car from your Forza Horizon 6 garage. Pick your name on first launch (Bryton or Kyle) to load your garage, set the event's filters, and tap Roll.

It's an installable web app. Each phone keeps its own garage, with no accounts and no sync.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm test
```

## Deploy (Cloudflare Workers static assets)

```bash
npx wrangler login   # once
npm run deploy
```

Live at https://forza6-randomizer.b-t-abrahams96.workers.dev. Config is in `wrangler.jsonc`.

On iPhone, open the link in Safari, then Share → Add to Home Screen, and open it from the Home Screen.

## Data

- `npm run fetch-cars` re-pulls all FH6 cars and photos from the Forza wiki into `src/data/cars.json` and `public/cars/`. Run it when the game adds cars. API responses are cached in `.cache/`.
- `seed/<name>-garage.tsv` holds a garage transcribed from in-game screenshots. `npm run seed -- <name>` turns it into `seed/<name>-garage.json`, which ships in the app (`src/data/players.ts`).

Car data and images: Forza Wiki (forza.fandom.com). Private fan app.
