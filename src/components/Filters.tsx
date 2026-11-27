import { cdnUrl } from '../lib/api.ts';
import type { Region, Season } from '../lib/types.ts';
import { REGIONS } from '../lib/wow.ts';

interface Props {
  seasons: Season[];
  season: Season;
  region: Region;
  dungeon: string;
  onSeason: (slug: string) => void;
  onRegion: (region: Region) => void;
  onDungeon: (slug: string) => void;
}

export function Filters({ seasons, season, region, dungeon, onSeason, onRegion, onDungeon }: Props) {
  return (
    <section className="filters" aria-label="Filter">
      <div className="filter-row">
        <label className="field">
          <span>Säsong</span>
          <select value={season.slug} onChange={(e) => onSeason(e.target.value)}>
            {seasons.map((s) => (
              <option key={s.slug} value={s.slug}>{s.name}</option>
            ))}
          </select>
        </label>

        <div className="field">
          <span>Region</span>
          <div className="segmented" role="radiogroup" aria-label="Region">
            {REGIONS.map((r) => (
              <button
                key={r.value}
                role="radio"
                aria-checked={region === r.value}
                className={region === r.value ? 'active' : ''}
                onClick={() => onRegion(r.value)}
              >
                {r.value === 'world' ? 'Världen' : r.value.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="dungeon-pills" role="radiogroup" aria-label="Dungeon">
        <button
          role="radio"
          aria-checked={dungeon === 'all'}
          className={`pill${dungeon === 'all' ? ' active' : ''}`}
          onClick={() => onDungeon('all')}
        >
          Alla dungeons
        </button>
        {season.dungeons.map((d) => (
          <button
            key={d.slug}
            role="radio"
            aria-checked={dungeon === d.slug}
            className={`pill${dungeon === d.slug ? ' active' : ''}`}
            onClick={() => onDungeon(d.slug)}
            title={d.name}
          >
            <img src={cdnUrl(d.icon_url)} alt="" width={20} height={20} loading="lazy" />
            {d.short_name}
          </button>
        ))}
      </div>
    </section>
  );
}
