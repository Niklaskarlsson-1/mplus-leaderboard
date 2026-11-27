// Små "fabriker" som bygger testdata. Varje test anger bara de fält
// som spelar roll för just det testet; resten får rimliga standardvärden.
import type {
  CharacterProfile,
  Ranking,
  Role,
  RosterMember,
  Season,
  StaticData,
} from '../lib/types.ts';

let nextId = 1;

export function makeMember(
  overrides: { name?: string; role?: Role; classSlug?: string; className?: string; spec?: string } = {}
): RosterMember {
  const id = nextId++;
  const classSlug = overrides.classSlug ?? 'mage';
  const spec = overrides.spec ?? 'Frost';
  return {
    role: overrides.role ?? 'dps',
    character: {
      id,
      name: overrides.name ?? `Spelare${id}`,
      class: { id: 1, name: overrides.className ?? 'Mage', slug: classSlug },
      spec: { id: 1, name: spec, slug: spec.toLowerCase() },
      path: `/characters/eu/sylvanas/Spelare${id}`,
      realm: { name: 'Sylvanas', slug: 'sylvanas' },
      region: { slug: 'eu', short_name: 'EU' },
    },
  };
}

export function makeRanking(
  overrides: {
    rank?: number;
    score?: number;
    level?: number;
    chests?: number;
    dungeon?: string;
    roster?: RosterMember[];
  } = {}
): Ranking {
  const id = nextId++;
  const dungeon = overrides.dungeon ?? 'Den of Nalorakk';
  const chests = overrides.chests ?? 1;
  return {
    rank: overrides.rank ?? 1,
    score: overrides.score ?? 500,
    run: {
      keystone_run_id: id,
      season: 'season-test',
      dungeon: {
        id: 1,
        name: dungeon,
        short_name: dungeon.slice(0, 3).toUpperCase(),
        slug: dungeon.toLowerCase().replace(/\s+/g, '-'),
        icon_url: '/images/icon.jpg',
        keystone_timer_ms: 1_800_000,
      },
      mythic_level: overrides.level ?? 20,
      clear_time_ms: 1_700_000,
      keystone_time_ms: 1_800_000,
      completed_at: '2026-11-24T16:14:37.000Z',
      num_chests: chests,
      time_remaining_ms: chests > 0 ? 100_000 : -60_000,
      weekly_modifiers: [],
      faction: 'horde',
      roster: overrides.roster ?? [
        makeMember({ role: 'tank', classSlug: 'warrior', className: 'Warrior', spec: 'Protection' }),
        makeMember({ role: 'healer', classSlug: 'priest', className: 'Priest', spec: 'Discipline' }),
        makeMember({ role: 'dps' }),
        makeMember({ role: 'dps' }),
        makeMember({ role: 'dps' }),
      ],
    },
  };
}

export function makeSeason(overrides: Partial<Season> = {}): Season {
  return {
    slug: 'season-test',
    name: 'Testsäsong',
    short_name: 'TS',
    is_main_season: true,
    dungeons: [
      {
        id: 1,
        slug: 'den-of-nalorakk',
        name: 'Den of Nalorakk',
        short_name: 'DON',
        keystone_timer_seconds: 1800,
        icon_url: 'https://cdn.example/icon.jpg',
        background_image_url: 'https://cdn.example/bg.jpg',
      },
      {
        id: 2,
        slug: 'murder-row',
        name: 'Murder Row',
        short_name: 'MR',
        keystone_timer_seconds: 2040,
        icon_url: 'https://cdn.example/icon2.jpg',
        background_image_url: 'https://cdn.example/bg2.jpg',
      },
    ],
    ...overrides,
  };
}

export function makeStaticData(): StaticData {
  return {
    seasons: [
      makeSeason(),
      makeSeason({ slug: 'season-special', name: 'Specialsäsong', is_main_season: false }),
    ],
  };
}

export function makeProfile(overrides: Partial<CharacterProfile> = {}): CharacterProfile {
  return {
    name: 'Rooiben',
    race: 'Dwarf',
    class: 'Paladin',
    active_spec_name: 'Holy',
    active_spec_role: 'HEALING',
    faction: 'alliance',
    achievement_points: 26415,
    thumbnail_url: 'https://render.worldofwarcraft.com/eu/character/sylvanas/248/1-avatar.jpg?alt=x',
    region: 'eu',
    realm: 'Sylvanas',
    last_crawled_at: '2026-11-27T10:12:40.000Z',
    profile_url: 'https://raider.io/characters/eu/sylvanas/Rooiben',
    guild: { name: 'Advance', realm: 'Draenor' },
    gear: {
      item_level_equipped: 338,
      items: {
        head: {
          item_id: 281239,
          item_level: 334,
          icon: 'inv_helm',
          name: "Corroded Hulk's Skullcap",
          item_quality: 4,
          gems: [240894],
          gems_detail: [{ id: 240894, name: '16 Haste & 7 Vers', icon: 'gem' }],
          enchants: [8017],
          enchants_detail: [{ id: 1, name: 'Enchant Helm - Empowered Rune of Avoidance', icon: 'x' }],
          bonuses: [6652, 13696],
        },
      },
    },
    talentLoadout: { loadout_text: 'CEEAAAAAAAAAA' },
    mythic_plus_scores_by_season: [
      {
        season: 'season-test',
        scores: { all: 4394.6, dps: 0, healer: 4394.6, tank: 0 },
        segments: {
          all: { score: 4394.6, color: '#ff8000' },
          dps: { score: 0, color: '#ffffff' },
          healer: { score: 4394.6, color: '#ff8000' },
          tank: { score: 0, color: '#ffffff' },
        },
      },
    ],
    mythic_plus_ranks: {
      overall: { world: 4, region: 4, realm: 1 },
      class: { world: 1, region: 1, realm: 1 },
    },
    mythic_plus_best_runs: [],
    mythic_plus_recent_runs: [],
    raid_progression: {
      'the-venomous-abyss': {
        summary: '8/8 M',
        total_bosses: 8,
        normal_bosses_killed: 0,
        heroic_bosses_killed: 8,
        mythic_bosses_killed: 8,
      },
      'tier-mn-1': {
        summary: '',
        total_bosses: 9,
        normal_bosses_killed: 0,
        heroic_bosses_killed: 0,
        mythic_bosses_killed: 0,
      },
    },
    ...overrides,
  };
}

/**
 * Ersätter fetch med en funktion som svarar utifrån URL:en.
 * `routes` matchas mot delar av URL:en, t.ex. 'static-data' eller 'mythic-plus/runs'.
 */
export function mockFetch(routes: Record<string, () => { status?: number; body?: unknown }>) {
  const fn = async (input: RequestInfo | URL) => {
    const url = String(input);
    const match = Object.keys(routes).find((part) => url.includes(part));
    if (!match) throw new Error(`Ingen mock för ${url}`);
    const { status = 200, body = {} } = routes[match]();
    return new Response(JSON.stringify(body), { status });
  };
  return fn;
}
