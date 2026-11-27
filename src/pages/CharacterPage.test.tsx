import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ROUTER_FUTURE } from '../lib/router.ts';
import { makeProfile, mockFetch } from '../test/fixtures.ts';
import { CharacterPage } from './CharacterPage.tsx';

function renderPage(url = '/character/eu/sylvanas/Rooiben') {
  return render(
    <MemoryRouter initialEntries={[url]} future={ROUTER_FUTURE}>
      <Routes>
        <Route path="/character/:region/:realm/:name" element={<CharacterPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('CharacterPage', () => {
  it('hämtar rätt karaktär utifrån URL:en', async () => {
    const fetch = vi.fn(mockFetch({ 'characters/profile': () => ({ body: makeProfile() }) }));
    vi.stubGlobal('fetch', fetch);
    renderPage('/character/eu/tarren-mill/Andymeow');

    await screen.findByRole('heading', { level: 1 });
    const url = new URL(String(fetch.mock.calls[0][0]));
    expect(url.searchParams.get('region')).toBe('eu');
    expect(url.searchParams.get('realm')).toBe('tarren-mill');
    expect(url.searchParams.get('name')).toBe('Andymeow');
  });

  it('visar namn, spec, guild och nyckeltal', async () => {
    vi.stubGlobal('fetch', mockFetch({ 'characters/profile': () => ({ body: makeProfile() }) }));
    renderPage();

    expect(await screen.findByRole('heading', { level: 1, name: 'Rooiben' })).toBeInTheDocument();
    expect(screen.getByText(/Dwarf Holy Paladin/)).toBeInTheDocument();
    expect(screen.getByText(/<Advance>/)).toBeInTheDocument();
    // Poängen syns både överst och i healer-rutan
    expect(screen.getByText('4394.6', { selector: '.hero-stat-value' })).toBeInTheDocument();
    expect(screen.getByText('4394.6', { selector: '.role-score' })).toBeInTheDocument();
    expect(screen.getByText('#4', { selector: '.hero-stat-value' })).toBeInTheDocument();
  });

  it('visar utrustning med Wowhead-data för tooltips', async () => {
    vi.stubGlobal('fetch', mockFetch({ 'characters/profile': () => ({ body: makeProfile() }) }));
    renderPage();

    const link = await screen.findByRole('link', { name: /Corroded Hulk's Skullcap/ });
    expect(link).toHaveAttribute(
      'data-wowhead',
      'item=281239&ilvl=334&bonus=6652:13696&gems=240894&ench=8017'
    );
    // "Enchant Helm - " tas bort så att bara enchantens namn syns
    expect(within(link).getByText(/Empowered Rune of Avoidance/)).toBeInTheDocument();
    expect(within(link).queryByText(/Enchant Helm/)).not.toBeInTheDocument();
  });

  it('visar bara riktiga raids, inte Raider.IO:s tier-sammanställningar', async () => {
    vi.stubGlobal('fetch', mockFetch({ 'characters/profile': () => ({ body: makeProfile() }) }));
    renderPage();

    expect(await screen.findByText('The Venomous Abyss')).toBeInTheDocument();
    expect(screen.queryByText(/Tier Mn 1/i)).not.toBeInTheDocument();
  });

  it('döljer poängpanelen när karaktären saknar Mythic+-poäng', async () => {
    const profile = makeProfile({ mythic_plus_scores_by_season: [] });
    vi.stubGlobal('fetch', mockFetch({ 'characters/profile': () => ({ body: profile }) }));
    renderPage();

    await screen.findByRole('heading', { level: 1 });
    expect(screen.queryByRole('heading', { name: 'Mythic+ poäng' })).not.toBeInTheDocument();
  });

  it('visar ett tydligt fel när karaktären inte finns', async () => {
    vi.stubGlobal('fetch', mockFetch({ 'characters/profile': () => ({ status: 400 }) }));
    renderPage('/character/eu/sylvanas/Finnsinte');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Hittade ingen karaktär som heter Finnsinte på sylvanas (EU).'
    );
    expect(screen.getByRole('link', { name: /Tillbaka till topplistan/ })).toBeInTheDocument();
  });
});
