import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ROUTER_FUTURE } from '../lib/router.ts';
import { makeRanking, makeStaticData, mockFetch } from '../test/fixtures.ts';
import { LeaderboardPage } from './LeaderboardPage.tsx';

/** Visar aktuell URL så att testerna kan kontrollera att filtren hamnar där. */
function LocationProbe() {
  const location = useLocation();
  return <span data-testid="location">{location.pathname + location.search}</span>;
}

function renderPage(url = '/') {
  return render(
    <MemoryRouter initialEntries={[url]} future={ROUTER_FUTURE}>
      <Routes>
        <Route path="/" element={<LeaderboardPage />} />
      </Routes>
      <LocationProbe />
    </MemoryRouter>
  );
}

function mockApi(runsStatus = 200) {
  const fetch = vi.fn(
    mockFetch({
      'static-data': () => ({ body: makeStaticData() }),
      'mythic-plus/runs': () =>
        runsStatus === 200
          ? { body: { rankings: [makeRanking({ level: 25, score: 561.3, dungeon: 'Den of Nalorakk' })] } }
          : { status: runsStatus },
    })
  );
  vi.stubGlobal('fetch', fetch);
  return fetch;
}

const runUrls = (fetch: ReturnType<typeof mockApi>) =>
  fetch.mock.calls.map(([u]) => new URL(String(u))).filter((u) => u.pathname.endsWith('/runs'));

describe('LeaderboardPage', () => {
  it('visar laddning och sedan topplistan', async () => {
    mockApi();
    renderPage();

    expect(screen.getByRole('status')).toHaveTextContent('Hämtar säsonger');
    expect(await screen.findByText('Bästa runs')).toBeInTheDocument();
    expect(screen.getByText('Testsäsong · Hela världen')).toBeInTheDocument();
    expect(screen.getAllByText('+25').length).toBeGreaterThan(0);
  });

  it('visar bara riktiga säsonger i säsongsväljaren', async () => {
    mockApi();
    renderPage();

    const select = await screen.findByLabelText('Säsong');
    expect(select.querySelectorAll('option')).toHaveLength(1);
  });

  it('läser filtren från URL:en', async () => {
    const fetch = mockApi();
    renderPage('/?region=eu&dungeon=murder-row');

    expect(await screen.findByText('Testsäsong · Europa')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 }).nextSibling).toHaveTextContent('Murder Row');
    const url = runUrls(fetch)[0];
    expect(url.searchParams.get('region')).toBe('eu');
    expect(url.searchParams.get('dungeon')).toBe('murder-row');
  });

  it('ignorerar ogiltiga värden i URL:en', async () => {
    const fetch = mockApi();
    renderPage('/?region=mars&dungeon=finns-inte');

    await screen.findByText('Bästa runs');
    const url = runUrls(fetch)[0];
    expect(url.searchParams.get('region')).toBe('world');
    expect(url.searchParams.get('dungeon')).toBe('all');
  });

  it('sparar valt filter i URL:en och hämtar ny data', async () => {
    const fetch = mockApi();
    renderPage();
    await screen.findByText('Bästa runs');

    await userEvent.click(screen.getByRole('radio', { name: 'EU' }));

    expect(screen.getByTestId('location')).toHaveTextContent('region=eu');
    expect(await screen.findByText('Testsäsong · Europa')).toBeInTheDocument();
    expect(runUrls(fetch).some((u) => u.searchParams.get('region') === 'eu')).toBe(true);
  });

  it('visar ett felmeddelande när Raider.IO inte svarar', async () => {
    mockApi(500);
    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Kunde inte hämta data: Raider.IO svarade 500'
    );
  });
});
