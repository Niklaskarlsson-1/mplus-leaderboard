# Mythic+ Topplista

En topplista för World of Warcraft Mythic+ byggd med React, TypeScript och Vite.
Data hämtas live från Raider.IO:s öppna API.

## Funktioner

- Topp 100 runs per säsong, region (värld, EU, US, KR, TW) och dungeon
- Nyckelnivå, tid mot tidsgräns, poäng och hela gruppen med klassfärger och roller
- Diagram över de populäraste specsen per roll (tank, healer, DPS)
- Sammanfattning: högsta nyckel, bästa poäng och vanligaste dungeon
- Länkar till varje spelares Raider.IO-profil

## Teknik

- **React 18 + TypeScript** (strikt läge) med typade API-svar
- **Vite** för utveckling och bygge
- Egen `useAsync`-hook för laddning, fel och data
- Enkel cache i minnet så att filterbyten går snabbt

## Kom igång

```bash
npm install
npm run dev
```

Öppna sedan http://localhost:5173.

---

Data från [Raider.IO](https://raider.io). Fanprojekt, inte anslutet till Blizzard Entertainment.
World of Warcraft är ett varumärke som tillhör Blizzard Entertainment.
