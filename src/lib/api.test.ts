import { describe, expect, it, vi } from 'vitest';
import { makeProfile, makeRanking, mockFetch } from '../test/fixtures.ts';
import { cdnUrl, characterPath, fetchCharacter, fetchTopRuns, PAGES, renderUrl } from './api.ts';

describe('renderUrl', () => {
  it('byter avatar-bilden mot helkroppsbilden och tar bort query-strängen', () => {
    const thumb = 'https://render.worldofwarcraft.com/eu/character/sylvanas/248/1-avatar.jpg?alt=/x.jpg';
    expect(renderUrl(thumb)).toBe(
      'https://render.worldofwarcraft.com/eu/character/sylvanas/248/1-main-raw.png'
    );
  });

  it('ger null för länkar som inte är avatar-bilder', () => {
    expect(renderUrl('https://example.com/bild.png')).toBeNull();
  });
});

describe('characterPath', () => {
  it('bygger en länk inom appen och kodar specialtecken i namnet', () => {
    expect(characterPath('eu', 'tarren-mill', 'Rååyanmcdrood')).toBe(
      '/character/eu/tarren-mill/R%C3%A5%C3%A5yanmcdrood'
    );
  });
});

describe('cdnUrl', () => {
  it('lägger till CDN-adressen på relativa sökvägar men rör inte fulla länkar', () => {
    expect(cdnUrl('/images/a.jpg')).toBe('https://cdn.raiderio.net/images/a.jpg');
    expect(cdnUrl('https://x.se/a.jpg')).toBe('https://x.se/a.jpg');
  });
});

describe('fetchTopRuns', () => {
  it('hämtar alla sidor parallellt och slår ihop dem i ordning', async () => {
    const fetch = vi.fn(async (input: RequestInfo | URL) => {
      const page = Number(new URL(String(input)).searchParams.get('page'));
      return new Response(JSON.stringify({ rankings: [makeRanking({ rank: page + 1 })] }));
    });
    vi.stubGlobal('fetch', fetch);

    const runs = await fetchTopRuns({ season: 's1', region: 'eu', dungeon: 'all' });

    expect(fetch).toHaveBeenCalledTimes(PAGES);
    expect(runs.map((r) => r.rank)).toEqual([1, 2, 3, 4, 5]);
    const firstUrl = new URL(String(fetch.mock.calls[0][0]));
    expect(firstUrl.searchParams.get('region')).toBe('eu');
    expect(firstUrl.searchParams.get('season')).toBe('s1');
  });

  it('återanvänder cachade svar i stället för att hämta igen', async () => {
    const fetch = vi.fn(mockFetch({ 'mythic-plus/runs': () => ({ body: { rankings: [] } }) }));
    vi.stubGlobal('fetch', fetch);
    const query = { season: 's1', region: 'eu' as const, dungeon: 'all' };

    await fetchTopRuns(query);
    await fetchTopRuns(query);

    expect(fetch).toHaveBeenCalledTimes(PAGES);
  });

  it('försöker igen efter ett misslyckat anrop i stället för att cacha felet', async () => {
    let fail = true;
    const fetch = vi.fn(
      mockFetch({
        'mythic-plus/runs': () => (fail ? { status: 500 } : { body: { rankings: [] } }),
      })
    );
    vi.stubGlobal('fetch', fetch);
    const query = { season: 's1', region: 'eu' as const, dungeon: 'all' };

    await expect(fetchTopRuns(query)).rejects.toThrow('Raider.IO svarade 500');
    fail = false;
    await expect(fetchTopRuns(query)).resolves.toEqual([]);
  });
});

describe('fetchCharacter', () => {
  it('returnerar profilen', async () => {
    vi.stubGlobal('fetch', mockFetch({ 'characters/profile': () => ({ body: makeProfile() }) }));

    const profile = await fetchCharacter('eu', 'sylvanas', 'Rooiben');

    expect(profile.name).toBe('Rooiben');
  });

  it('ger ett begripligt fel när karaktären inte finns', async () => {
    vi.stubGlobal('fetch', mockFetch({ 'characters/profile': () => ({ status: 400 }) }));

    await expect(fetchCharacter('eu', 'sylvanas', 'Finnsinte')).rejects.toThrow(
      'Hittade ingen karaktär som heter Finnsinte på sylvanas (EU).'
    );
  });

  it('släpper igenom andra fel oförändrade', async () => {
    vi.stubGlobal('fetch', mockFetch({ 'characters/profile': () => ({ status: 503 }) }));

    await expect(fetchCharacter('eu', 'sylvanas', 'Rooiben')).rejects.toThrow('Raider.IO svarade 503');
  });
});
