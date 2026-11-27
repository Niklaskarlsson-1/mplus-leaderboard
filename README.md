# Mythic+ Topplista

[![CI](https://github.com/Niklaskarlsson-1/mplus-leaderboard/actions/workflows/ci.yml/badge.svg)](https://github.com/Niklaskarlsson-1/mplus-leaderboard/actions/workflows/ci.yml)

En topplista för World of Warcraft Mythic+ byggd med React, TypeScript och Vite.
Data hämtas live från Raider.IO:s öppna API.

## Funktioner

- Topp 100 runs per säsong, region (värld, EU, US, KR, TW) och dungeon
- Nyckelnivå, tid mot tidsgräns, poäng och hela gruppen med klassfärger och roller
- Diagram över de populäraste specsen per roll (tank, healer, DPS)
- Sammanfattning: högsta nyckel, bästa poäng och vanligaste dungeon
- **Karaktärssidor**: klicka på en spelare för att se
  - helkroppsbild, guild, item level, Mythic+-poäng per roll och rankning
  - all utrustning med enchants och gems, med Wowhead-tooltips som visar exakta stats
  - bästa run per dungeon, senaste runs och raid-progress
  - knapp för att kopiera talangsträngen och importera den i spelet

## Teknik

- **React 18 + TypeScript** (strikt läge) med typade API-svar
- **React Router** (HashRouter) med filtren sparade i URL:en, så att länkar kan delas
- **Vite** för utveckling och bygge
- Egen `useAsync`-hook för laddning, fel och data
- Enkel cache i minnet så att filterbyten går snabbt
- **Vitest + React Testing Library** med 53 tester

## Kom igång

```bash
npm install
npm run dev
```

Öppna sedan http://localhost:5173.

## Tester

```bash
npm test            # kör alla tester en gång
npm run test:watch  # kör om testerna när du sparar
```

Testerna täcker tre nivåer:

- **Logik** (`src/lib/*.test.ts`): tidsformat, klassfärger, räkning av populära specs och API-lagret, med cache, felhantering och tydligt fel när en karaktär inte finns.
- **Komponenter** (`src/components/*.test.tsx`): filter, topplistans tabell med "Visa fler" och spec-diagrammet med rollbyte och tooltip.
- **Sidor** (`src/pages/*.test.tsx`): hela topplistan och karaktärssidan med mockat API, inklusive filter i URL:en, laddning och felmeddelanden.

Typkontroll, tester och bygge körs automatiskt med GitHub Actions vid varje pull request och push till `main` (`.github/workflows/ci.yml`).

Inga riktiga anrop görs mot Raider.IO i testerna; `fetch` ersätts med testdata från `src/test/fixtures.ts`.

---

Data från [Raider.IO](https://raider.io), föremåls-tooltips från [Wowhead](https://www.wowhead.com). Fanprojekt, inte anslutet till Blizzard Entertainment.
World of Warcraft är ett varumärke som tillhör Blizzard Entertainment.
