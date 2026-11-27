import { describe, expect, it } from 'vitest';
import { makeMember, makeRanking } from '../test/fixtures.ts';
import { countSpecs } from './stats.ts';

const frostMage = () => makeMember({ role: 'dps', classSlug: 'mage', className: 'Mage', spec: 'Frost' });
const arcaneMage = () => makeMember({ role: 'dps', classSlug: 'mage', className: 'Mage', spec: 'Arcane' });
const holyPala = () =>
  makeMember({ role: 'healer', classSlug: 'paladin', className: 'Paladin', spec: 'Holy' });

describe('countSpecs', () => {
  it('räknar bara spelare med vald roll', () => {
    const rankings = [makeRanking({ roster: [frostMage(), holyPala()] })];

    const healers = countSpecs(rankings, 'healer');

    expect(healers).toHaveLength(1);
    expect(healers[0]).toMatchObject({ spec: 'Holy', className: 'Paladin', runs: 1 });
  });

  it('räknar två av samma spec i en grupp som en run', () => {
    const rankings = [makeRanking({ roster: [frostMage(), frostMage(), frostMage()] })];

    expect(countSpecs(rankings, 'dps')[0].runs).toBe(1);
  });

  it('räknar samma spec över flera runs', () => {
    const rankings = [
      makeRanking({ roster: [frostMage()] }),
      makeRanking({ roster: [frostMage()] }),
      makeRanking({ roster: [arcaneMage()] }),
    ];

    const stats = countSpecs(rankings, 'dps');

    expect(stats.map((s) => [s.spec, s.runs])).toEqual([
      ['Frost', 2],
      ['Arcane', 1],
    ]);
  });

  it('sorterar alfabetiskt när antalet är lika', () => {
    const rankings = [makeRanking({ roster: [frostMage(), arcaneMage()] })];

    expect(countSpecs(rankings, 'dps').map((s) => s.spec)).toEqual(['Arcane', 'Frost']);
  });

  it('skiljer på specs med samma namn i olika klasser', () => {
    const holyPriest = makeMember({ role: 'healer', classSlug: 'priest', className: 'Priest', spec: 'Holy' });
    const rankings = [makeRanking({ roster: [holyPala(), holyPriest] })];

    expect(countSpecs(rankings, 'healer')).toHaveLength(2);
  });

  it('ger en tom lista när det inte finns några runs', () => {
    expect(countSpecs([], 'tank')).toEqual([]);
  });
});
