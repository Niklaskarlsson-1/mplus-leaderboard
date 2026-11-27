// Typer för de delar av Raider.IO:s API som appen använder.
// Svaren innehåller fler fält än så här, men vi typar bara det vi läser.

export type Region = 'world' | 'eu' | 'us' | 'kr' | 'tw';
export type Role = 'tank' | 'healer' | 'dps';

export interface Dungeon {
  id: number;
  slug: string;
  name: string;
  short_name: string;
  keystone_timer_seconds: number;
  icon_url: string;
  background_image_url: string;
}

export interface Season {
  slug: string;
  name: string;
  short_name: string;
  is_main_season: boolean;
  dungeons: Dungeon[];
}

export interface StaticData {
  seasons: Season[];
}

export interface NamedRef {
  id: number;
  name: string;
  slug: string;
}

export interface RosterMember {
  role: Role;
  character: {
    id: number;
    name: string;
    class: NamedRef;
    spec: NamedRef;
    path: string;
    realm: { name: string; slug: string };
    region: { slug: string; short_name: string };
  };
}

export interface Affix {
  id: number;
  name: string;
  slug: string;
  description: string;
}

export interface Run {
  keystone_run_id: number;
  season: string;
  dungeon: {
    id: number;
    name: string;
    short_name: string;
    slug: string;
    icon_url: string;
    keystone_timer_ms: number;
  };
  mythic_level: number;
  clear_time_ms: number;
  keystone_time_ms: number;
  completed_at: string;
  num_chests: number;
  time_remaining_ms: number;
  weekly_modifiers: Affix[];
  faction: 'alliance' | 'horde';
  roster: RosterMember[];
}

export interface Ranking {
  rank: number;
  score: number;
  run: Run;
}

export interface RunsResponse {
  rankings: Ranking[];
  leaderboard_url: string;
}

// ---------- Karaktärsprofil ----------

export interface ItemDetail {
  id: number;
  name: string;
  icon: string;
}

export interface GearItem {
  item_id: number;
  item_level: number;
  icon: string;
  name: string;
  item_quality: number;
  gems: number[];
  gems_detail: ItemDetail[];
  enchants: number[];
  enchants_detail: ItemDetail[];
  bonuses: number[];
}

export type GearSlot =
  | 'head' | 'neck' | 'shoulder' | 'back' | 'chest' | 'wrist'
  | 'hands' | 'waist' | 'legs' | 'feet' | 'finger1' | 'finger2'
  | 'trinket1' | 'trinket2' | 'mainhand' | 'offhand';

export interface ScoreSegment {
  score: number;
  color: string;
}

export interface SeasonScores {
  season: string;
  scores: { all: number; dps: number; healer: number; tank: number };
  segments: {
    all: ScoreSegment;
    dps: ScoreSegment;
    healer: ScoreSegment;
    tank: ScoreSegment;
  };
}

export interface RankSet {
  world: number;
  region: number;
  realm: number;
}

export interface BestRun {
  dungeon: string;
  short_name: string;
  mythic_level: number;
  completed_at: string;
  clear_time_ms: number;
  par_time_ms: number;
  num_keystone_upgrades: number;
  keystone_run_id: number;
  icon_url: string;
  background_image_url: string;
  score: number;
  url: string;
  spec?: { name: string };
  role?: Role;
}

export interface RaidProgress {
  summary: string;
  total_bosses: number;
  normal_bosses_killed: number;
  heroic_bosses_killed: number;
  mythic_bosses_killed: number;
}

export interface CharacterProfile {
  name: string;
  race: string;
  class: string;
  active_spec_name: string;
  active_spec_role: 'TANK' | 'HEALING' | 'DPS';
  faction: 'alliance' | 'horde';
  achievement_points: number;
  thumbnail_url: string;
  region: string;
  realm: string;
  last_crawled_at: string;
  profile_url: string;
  guild: { name: string; realm: string } | null;
  gear: {
    item_level_equipped: number;
    items: Partial<Record<GearSlot, GearItem>>;
  };
  talentLoadout?: { loadout_text: string };
  mythic_plus_scores_by_season: SeasonScores[];
  mythic_plus_ranks: { overall: RankSet; class: RankSet } & Record<string, RankSet>;
  mythic_plus_best_runs: BestRun[];
  mythic_plus_recent_runs: BestRun[];
  raid_progression: Record<string, RaidProgress>;
}
