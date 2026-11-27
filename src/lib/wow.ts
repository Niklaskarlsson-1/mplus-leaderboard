import type { Region, Role } from './types.ts';

/** Blizzards officiella klassfärger, nycklade på Raider.IO:s klass-slug. */
export const CLASS_COLORS: Record<string, string> = {
  'death-knight': '#C41E3A',
  'demon-hunter': '#A330C9',
  druid: '#FF7C0A',
  evoker: '#33937F',
  hunter: '#AAD372',
  mage: '#3FC7EB',
  monk: '#00FF98',
  paladin: '#F48CBA',
  priest: '#FFFFFF',
  rogue: '#FFF468',
  shaman: '#0070DD',
  warlock: '#8788EE',
  warrior: '#C69B6D',
};

export function classColor(slug: string): string {
  return CLASS_COLORS[slug] ?? '#9aa3b8';
}

export const REGIONS: { value: Region; label: string }[] = [
  { value: 'world', label: 'Hela världen' },
  { value: 'eu', label: 'Europa' },
  { value: 'us', label: 'Amerika' },
  { value: 'kr', label: 'Korea' },
  { value: 'tw', label: 'Taiwan' },
];

export const ROLE_ORDER: Role[] = ['tank', 'healer', 'dps'];

export const ROLE_LABELS: Record<Role, string> = {
  tank: 'Tank',
  healer: 'Healer',
  dps: 'DPS',
};

/** 1851441 ms -> "30:51" */
export function formatDuration(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
}

/** "Death Knight" -> "death-knight", för att slå upp klassfärgen. */
export function classSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

/** Färger för föremålskvalitet, som i spelet. */
export const QUALITY_COLORS: Record<number, string> = {
  0: '#9d9d9d', // poor
  1: '#ffffff', // common
  2: '#1eff00', // uncommon
  3: '#0070dd', // rare
  4: '#a335ee', // epic
  5: '#ff8000', // legendary
  6: '#e6cc80', // artifact
  7: '#00ccff', // heirloom
};

export function qualityColor(quality: number): string {
  return QUALITY_COLORS[quality] ?? '#ffffff';
}

/** "the-venomous-abyss" -> "The Venomous Abyss" */
export function titleFromSlug(slug: string): string {
  return slug
    .split('-')
    .map((w, i) => (i > 0 && ['of', 'the', 'and'].includes(w) ? w : w[0].toUpperCase() + w.slice(1)))
    .join(' ');
}

export function formatNumber(n: number): string {
  return n.toLocaleString('sv-SE');
}
