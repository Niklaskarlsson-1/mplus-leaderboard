import type { Ranking, Role } from './types.ts';

export interface SpecStat {
  key: string;
  spec: string;
  className: string;
  classSlug: string;
  runs: number; // antal runs där specen finns med
}

/**
 * Räknar i hur många runs varje spec finns med, för en viss roll.
 * Två spelare med samma spec i en grupp räknas som en run.
 * Sorteras efter flest runs, sedan alfabetiskt.
 */
export function countSpecs(rankings: Ranking[], role: Role): SpecStat[] {
  const stats = new Map<string, SpecStat>();
  for (const { run } of rankings) {
    const seen = new Set<string>();
    for (const m of run.roster) {
      if (m.role !== role) continue;
      const c = m.character;
      const key = `${c.class.slug}:${c.spec.slug}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const s = stats.get(key) ?? {
        key,
        spec: c.spec.name,
        className: c.class.name,
        classSlug: c.class.slug,
        runs: 0,
      };
      s.runs++;
      stats.set(key, s);
    }
  }
  return [...stats.values()].sort((a, b) => b.runs - a.runs || a.spec.localeCompare(b.spec));
}
