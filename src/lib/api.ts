import type { CharacterProfile, Ranking, Region, RunsResponse, StaticData } from './types.ts';

const BASE = 'https://raider.io/api/v1';
const CDN = 'https://cdn.raiderio.net';

/** Expansion-id hos Raider.IO för Midnight. */
export const EXPANSION_ID = 11;

/** Raider.IO ger 20 runs per sida. Vi hämtar topp 100. */
export const PAGE_SIZE = 20;
export const PAGES = 5;

// Enkel cache i minnet så att man kan växla filter fram och tillbaka
// utan att hämta samma data igen. Delade anrop återanvänds, så de
// avbryts inte; komponenterna ignorerar i stället svar som kommer in
// efter att filtret har ändrats.
const cache = new Map<string, Promise<unknown>>();

/** Tömmer cachen. Används av testerna. */
export function clearCache(): void {
  cache.clear();
}

async function getJson<T>(url: string): Promise<T> {
  const cached = cache.get(url);
  if (cached) return cached as Promise<T>;

  const request = fetch(url).then(async (res) => {
    if (!res.ok) throw new Error(`Raider.IO svarade ${res.status}`);
    return (await res.json()) as T;
  });
  cache.set(url, request);
  // Misslyckade anrop ska inte ligga kvar i cachen.
  request.catch(() => cache.delete(url));
  return request;
}

export function fetchStaticData(): Promise<StaticData> {
  return getJson<StaticData>(`${BASE}/mythic-plus/static-data?expansion_id=${EXPANSION_ID}`);
}

export interface RunsQuery {
  season: string;
  region: Region;
  dungeon: string; // slug eller 'all'
}

/** Hämtar topp 100 runs (5 sidor parallellt) för valt filter. */
export async function fetchTopRuns(q: RunsQuery): Promise<Ranking[]> {
  const pages = Array.from({ length: PAGES }, (_, page) => {
    const params = new URLSearchParams({
      season: q.season,
      region: q.region,
      dungeon: q.dungeon,
      affixes: 'all',
      page: String(page),
    });
    return getJson<RunsResponse>(`${BASE}/mythic-plus/runs?${params}`);
  });
  const results = await Promise.all(pages);
  return results.flatMap((r) => r.rankings);
}

/** Raider.IO returnerar ibland relativa bildsökvägar. */
export function cdnUrl(path: string): string {
  return path.startsWith('http') ? path : `${CDN}${path}`;
}

/** Länk inom appen till en karaktärssida. */
export function characterPath(region: string, realm: string, name: string): string {
  return `/character/${region}/${realm}/${encodeURIComponent(name)}`;
}

/** Raider.IO:s ikonbilder, t.ex. "inv_sword_1h_ulatek_d_01". */
export function iconUrl(icon: string): string {
  return `${CDN}/images/wow/icons/large/${icon}.jpg`;
}

const PROFILE_FIELDS = [
  'gear',
  'guild',
  'talents',
  'raid_progression',
  'mythic_plus_scores_by_season:current',
  'mythic_plus_ranks',
  'mythic_plus_best_runs',
  'mythic_plus_recent_runs',
].join(',');

export async function fetchCharacter(
  region: string,
  realm: string,
  name: string
): Promise<CharacterProfile> {
  const params = new URLSearchParams({ region, realm, name, fields: PROFILE_FIELDS });
  try {
    return await getJson<CharacterProfile>(`${BASE}/characters/profile?${params}`);
  } catch (err) {
    // Raider.IO svarar 400 när karaktären inte finns.
    if (err instanceof Error && err.message.includes('400')) {
      throw new Error(`Hittade ingen karaktär som heter ${name} på ${realm} (${region.toUpperCase()}).`);
    }
    throw err;
  }
}

/**
 * Blizzard har tre bilder per karaktär: avatar, inset och main-raw
 * (helkropp utan bakgrund). Raider.IO ger oss avatar-länken.
 */
export function renderUrl(thumbnail: string): string | null {
  const base = thumbnail.split('?')[0];
  return base.endsWith('-avatar.jpg') ? base.replace('-avatar.jpg', '-main-raw.png') : null;
}
