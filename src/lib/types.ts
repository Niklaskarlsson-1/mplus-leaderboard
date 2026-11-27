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
