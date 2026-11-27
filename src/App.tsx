import { useState } from 'react';
import { Filters } from './components/Filters.tsx';
import { RunsTable } from './components/RunsTable.tsx';
import { SpecChart } from './components/SpecChart.tsx';
import { cdnUrl, fetchStaticData, fetchTopRuns } from './lib/api.ts';
import type { Ranking, Region, Season } from './lib/types.ts';
import { useAsync } from './lib/useAsync.ts';
import { REGIONS } from './lib/wow.ts';

export default function App() {
  const staticData = useAsync(fetchStaticData, []);

  if (staticData.status === 'loading') return <Shell><Loading text="Hämtar säsonger…" /></Shell>;
  if (staticData.status === 'error') return <Shell><ErrorBox message={staticData.error} /></Shell>;

  // Visa bara riktiga säsonger, inte specialvarianter som "Break the Meta".
  const seasons = staticData.data.seasons.filter((s) => s.is_main_season);
  return <Leaderboard seasons={seasons} />;
}

function Leaderboard({ seasons }: { seasons: Season[] }) {
  const [seasonSlug, setSeasonSlug] = useState(seasons[0].slug);
  const [region, setRegion] = useState<Region>('world');
  const [dungeon, setDungeon] = useState('all');

  const season = seasons.find((s) => s.slug === seasonSlug) ?? seasons[0];
  const runs = useAsync(
    () => fetchTopRuns({ season: season.slug, region, dungeon }),
    [season.slug, region, dungeon]
  );

  const selectedDungeon = season.dungeons.find((d) => d.slug === dungeon);
  const heroImage = (selectedDungeon ?? season.dungeons[0])?.background_image_url;
  const regionLabel = REGIONS.find((r) => r.value === region)?.label;

  const changeSeason = (slug: string) => {
    setSeasonSlug(slug);
    setDungeon('all'); // dungeons skiljer sig mellan säsonger
  };

  return (
    <Shell heroImage={heroImage ? cdnUrl(heroImage) : undefined}>
      <header className="hero">
        <p className="eyebrow">{season.name} · {regionLabel}</p>
        <h1>Mythic+ Topplista</h1>
        <p className="hero-sub">
          {selectedDungeon ? selectedDungeon.name : 'De högsta nycklarna i alla dungeons'}
        </p>
      </header>

      <Filters
        seasons={seasons}
        season={season}
        region={region}
        dungeon={dungeon}
        onSeason={changeSeason}
        onRegion={setRegion}
        onDungeon={setDungeon}
      />

      {runs.status === 'loading' && <Loading text="Hämtar topp 100…" />}
      {runs.status === 'error' && <ErrorBox message={runs.error} />}
      {runs.status === 'success' && (
        <>
          <Summary rankings={runs.data} showDungeon={dungeon === 'all'} />
          <div className="content-grid">
            <RunsTable key={`${season.slug}-${region}-${dungeon}`} rankings={runs.data} />
            <SpecChart rankings={runs.data} />
          </div>
        </>
      )}
    </Shell>
  );
}

function Summary({ rankings, showDungeon }: { rankings: Ranking[]; showDungeon: boolean }) {
  if (rankings.length === 0) return null;

  const highestKey = Math.max(...rankings.map((r) => r.run.mythic_level));
  const bestScore = Math.max(...rankings.map((r) => r.score));

  const dungeonCounts = new Map<string, number>();
  for (const { run } of rankings) {
    dungeonCounts.set(run.dungeon.name, (dungeonCounts.get(run.dungeon.name) ?? 0) + 1);
  }
  const [topDungeon, topCount] = [...dungeonCounts].sort((a, b) => b[1] - a[1])[0];

  const timed = rankings.filter((r) => r.run.num_chests > 0).length;

  return (
    <section className="summary" aria-label="Sammanfattning">
      <div className="stat-tile">
        <span className="stat-label">Högsta nyckel</span>
        <span className="stat-value">+{highestKey}</span>
      </div>
      <div className="stat-tile">
        <span className="stat-label">Bästa poäng</span>
        <span className="stat-value">{bestScore.toFixed(1)}</span>
      </div>
      {showDungeon ? (
        <div className="stat-tile">
          <span className="stat-label">Vanligaste dungeon</span>
          <span className="stat-value stat-text">{topDungeon}</span>
          <span className="stat-note">{topCount} av {rankings.length} runs</span>
        </div>
      ) : (
        <div className="stat-tile">
          <span className="stat-label">Inom tidsgränsen</span>
          <span className="stat-value">{timed} / {rankings.length}</span>
        </div>
      )}
    </section>
  );
}

function Shell({ children, heroImage }: { children: React.ReactNode; heroImage?: string }) {
  return (
    <div className="shell">
      {heroImage && (
        <div className="backdrop" style={{ backgroundImage: `url("${heroImage}")` }} aria-hidden />
      )}
      <main className="container">{children}</main>
      <footer className="footer">
        Data från <a href="https://raider.io" target="_blank" rel="noreferrer">Raider.IO</a>.
        Fanprojekt, inte anslutet till Blizzard Entertainment.
      </footer>
    </div>
  );
}

function Loading({ text }: { text: string }) {
  return (
    <div className="state" role="status">
      <span className="spinner" aria-hidden /> {text}
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="state error" role="alert">
      Kunde inte hämta data: {message}
    </div>
  );
}
