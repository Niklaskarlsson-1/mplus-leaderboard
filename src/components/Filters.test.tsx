import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { makeSeason } from '../test/fixtures.ts';
import { Filters } from './Filters.tsx';

function renderFilters(props: Partial<Parameters<typeof Filters>[0]> = {}) {
  const season = makeSeason();
  const handlers = { onSeason: vi.fn(), onRegion: vi.fn(), onDungeon: vi.fn() };
  render(
    <Filters seasons={[season]} season={season} region="world" dungeon="all" {...handlers} {...props} />
  );
  return handlers;
}

describe('Filters', () => {
  it('markerar vald region och dungeon', () => {
    renderFilters({ region: 'eu', dungeon: 'murder-row' });

    expect(screen.getByRole('radio', { name: 'EU' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Världen' })).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('radio', { name: 'MR' })).toHaveAttribute('aria-checked', 'true');
  });

  it('visar en knapp per dungeon i säsongen plus "Alla dungeons"', () => {
    renderFilters();

    const dungeons = screen.getByRole('radiogroup', { name: 'Dungeon' });
    expect(dungeons.querySelectorAll('button')).toHaveLength(3);
  });

  it('anropar onRegion när man väljer en region', async () => {
    const { onRegion } = renderFilters();

    await userEvent.click(screen.getByRole('radio', { name: 'KR' }));

    expect(onRegion).toHaveBeenCalledWith('kr');
  });

  it('anropar onDungeon med dungeonens slug', async () => {
    const { onDungeon } = renderFilters();

    await userEvent.click(screen.getByRole('radio', { name: 'DON' }));

    expect(onDungeon).toHaveBeenCalledWith('den-of-nalorakk');
  });

  it('anropar onSeason när man byter säsong', async () => {
    const other = makeSeason({ slug: 'season-old', name: 'Gammal säsong' });
    const { onSeason } = renderFilters({ seasons: [makeSeason(), other] });

    await userEvent.selectOptions(screen.getByLabelText('Säsong'), 'season-old');

    expect(onSeason).toHaveBeenCalledWith('season-old');
  });
});
