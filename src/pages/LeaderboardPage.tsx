import { useSearchParams } from 'react-router-dom';
import { Filters } from '../components/Filters.tsx';
import { ErrorBox, Loading, Shell } from '../components/Layout.tsx';
import { RunsTable } from '../components/RunsTable.tsx';
import { SpecChart } from '../components/SpecChart.tsx';
import { cdnUrl, fetchStaticData, fetchTopRuns } from '../lib/api.ts';
import type { Ranking, Region, Season } from '../lib/types.ts';
import { useAsync } from '../lib/useAsync.ts';
import { REGIONS } from '../lib/wow.ts';

export function LeaderboardPage() {
  const staticData = useAsync(fetchStaticData, []);

  if (staticData.status === 'loading') return <Shell><Loading text="Hämtar säsonger…" /></Shell>;
  if (staticData.status === 'error') {
    return <Shell><ErrorBox message={`Kunde inte hämta data: ${staticData.error}`} /></Shell>;
  }

  // Visa bara riktiga säsonger, inte specialvarianter som "Break the Meta".
  const seasons = staticData.data.seasons.filter((s) => s.is_main_season);
  return <Leaderboard seasons={seasons} />;
}

function isRegion(value: string | null): value is Region {
  return REGIONS.some((r) => r.value === value);
}

function Leaderboard({ seasons }: { seasons: Season[] }) {
  // Filtren ligger i URL:en (?season=…&region=…&dungeon=…), så de finns kvar
  // när man går tillbaka från en karaktär och kan delas som länk.
  const [params, setParams] = useSearchParams();
  const season = seasons.find((s) => s.slug === params.get('season')) ?? seasons[0];
  const regionParam = params.get('region');
  const region: Region = isRegion(regionParam) ? regionParam : 'world';
  const dungeonParam = params.get('dungeon') ?? 'all';
  const dungeon = season.dungeons.some((d) => d.slug === dungeonParam) ? dungeonParam : 'all';

  const update = (changes: Record<string, string>) => {
    const next = { season: season.slug, region, dungeon, ...changes };
    setParams(next, { replace: true });
  };

  const runs = useAsync(
    () => fetchTopRuns({ season: season.slug, region, dungeon }),
    [season.slug, region, dungeon]
  );

  const selectedDungeon = season.dungeons.find((d) => d.slug === dungeon);
  const heroImage = (selectedDungeon ?? season.dungeons[0])?.background_image_url;
  const regionLabel = REGIONS.find((r) => r.value === region)?.label;

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
        // dungeons skiljer sig mellan säsonger, så dungeon nollställs
        onSeason={(slug) => update({ season: slug, dungeon: 'all' })}
        onRegion={(r) => update({ region: r })}
        onDungeon={(d) => update({ dungeon: d })}
      />

      {runs.status === 'loading' && <Loading text="Hämtar topp 100…" />}
      {runs.status === 'error' && <ErrorBox message={`Kunde inte hämta data: ${runs.error}`} />}
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
