import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Gear } from '../components/Gear.tsx';
import { ErrorBox, Loading, Shell } from '../components/Layout.tsx';
import { RoleIcon } from '../components/RoleIcon.tsx';
import { cdnUrl, fetchCharacter, renderUrl } from '../lib/api.ts';
import type { BestRun, CharacterProfile, RaidProgress, RankSet, Role } from '../lib/types.ts';
import { useAsync } from '../lib/useAsync.ts';
import {
  classColor,
  classSlug,
  formatDate,
  formatDuration,
  formatNumber,
  ROLE_LABELS,
  titleFromSlug,
} from '../lib/wow.ts';

export function CharacterPage() {
  const { region = '', realm = '', name = '' } = useParams();
  const profile = useAsync(() => fetchCharacter(region, realm, name), [region, realm, name]);

  return (
    <Shell>
      <BackLink />
      {profile.status === 'loading' && <Loading text={`Hämtar ${name}…`} />}
      {profile.status === 'error' && <ErrorBox message={profile.error} />}
      {profile.status === 'success' && <Character c={profile.data} />}
    </Shell>
  );
}

function BackLink() {
  const navigate = useNavigate();
  // Gå tillbaka i historiken om möjligt, så att topplistans filter finns kvar.
  const hasHistory = window.history.state?.idx > 0;
  return (
    <Link
      to="/"
      className="back-link"
      onClick={(e) => {
        if (hasHistory) {
          e.preventDefault();
          navigate(-1);
        }
      }}
    >
      ← Tillbaka till topplistan
    </Link>
  );
}

const ROLE_FROM_API: Record<CharacterProfile['active_spec_role'], Role> = {
  TANK: 'tank',
  HEALING: 'healer',
  DPS: 'dps',
};

function Character({ c }: { c: CharacterProfile }) {
  const color = classColor(classSlug(c.class));
  const season = c.mythic_plus_scores_by_season[0];
  const render = renderUrl(c.thumbnail_url);
  const role = ROLE_FROM_API[c.active_spec_role];

  return (
    <>
      <header className="char-hero" style={{ ['--class-color' as string]: color }}>
        {render && <CharacterRender src={render} />}
        <div className="char-hero-info">
          <img className="char-avatar" src={c.thumbnail_url} alt="" width={84} height={84} />
          <div>
            <p className="eyebrow">
              {c.realm} · {c.region.toUpperCase()}
              {c.guild && <> · &lt;{c.guild.name}&gt;</>}
            </p>
            <h1 className="char-name" style={{ color }}>{c.name}</h1>
            <p className="hero-sub">
              <RoleIcon role={role} /> {c.race} {c.active_spec_name} {c.class}
            </p>
          </div>
        </div>

        <div className="char-stats">
          <HeroStat
            label="Mythic+ poäng"
            value={season ? season.scores.all.toFixed(1) : '–'}
            color={season?.segments.all.color}
          />
          <HeroStat label="Item level" value={String(c.gear.item_level_equipped)} />
          <HeroStat label="Världsrank" value={rankText(c.mythic_plus_ranks.overall.world)} />
          <HeroStat label="Achievements" value={formatNumber(c.achievement_points)} />
        </div>

        <div className="char-actions">
          <a className="button-ghost" href={c.profile_url} target="_blank" rel="noreferrer">
            Öppna på Raider.IO ↗
          </a>
          {c.talentLoadout?.loadout_text && <CopyTalents text={c.talentLoadout.loadout_text} />}
        </div>
      </header>

      <div className="char-grid">
        <Gear items={c.gear.items} itemLevel={c.gear.item_level_equipped} />
        <div className="char-side">
          {season && <ScorePanel c={c} />}
          <RaidPanel raids={c.raid_progression} />
        </div>
      </div>

      <BestRuns runs={c.mythic_plus_best_runs} />
      <RecentRuns runs={c.mythic_plus_recent_runs} />

      <p className="muted small updated">
        Senast uppdaterad av Raider.IO {new Date(c.last_crawled_at).toLocaleString('sv-SE')}
      </p>
    </>
  );
}

/** Helkroppsbilden finns inte för alla karaktärer, så den döljs om den inte laddar. */
function CharacterRender({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return <img className="char-render" src={src} alt="" onError={() => setFailed(true)} />;
}

function HeroStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="hero-stat">
      <span className="stat-label">{label}</span>
      <span className="hero-stat-value" style={color ? { color } : undefined}>{value}</span>
    </div>
  );
}

function rankText(rank: number): string {
  return rank > 0 ? `#${formatNumber(rank)}` : '–';
}

function CopyTalents({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="button-ghost"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      title="Klistra in i spelets talent-fönster under Import"
    >
      {copied ? 'Kopierat ✓' : 'Kopiera talanger'}
    </button>
  );
}

function ScorePanel({ c }: { c: CharacterProfile }) {
  const season = c.mythic_plus_scores_by_season[0];
  const roles: Role[] = ['tank', 'healer', 'dps'];
  const ranks = c.mythic_plus_ranks;

  const rankRow = (label: string, r?: RankSet) =>
    r && r.world > 0 ? (
      <tr>
        <th>{label}</th>
        <td>{rankText(r.world)}</td>
        <td>{rankText(r.region)}</td>
        <td>{rankText(r.realm)}</td>
      </tr>
    ) : null;

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Mythic+ poäng</h2>
      </div>
      <ul className="role-scores">
        {roles.map((r) => {
          const seg = season.segments[r];
          return (
            <li key={r} className={seg.score > 0 ? '' : 'inactive'}>
              <span className="role-label"><RoleIcon role={r} /> {ROLE_LABELS[r]}</span>
              <span className="role-score" style={seg.score > 0 ? { color: seg.color } : undefined}>
                {seg.score > 0 ? seg.score.toFixed(1) : '–'}
              </span>
            </li>
          );
        })}
      </ul>

      <table className="rank-table">
        <thead>
          <tr>
            <th />
            <th>Världen</th>
            <th>Region</th>
            <th>Realm</th>
          </tr>
        </thead>
        <tbody>
          {rankRow('Totalt', ranks.overall)}
          {rankRow(c.class, ranks.class)}
        </tbody>
      </table>
    </section>
  );
}

function RaidPanel({ raids }: { raids: Record<string, RaidProgress> }) {
  // "tier-…" är sammanslagningar som Raider.IO gör; visa bara riktiga raids.
  const entries = Object.entries(raids).filter(([slug, r]) => !slug.startsWith('tier-') && r.summary);
  if (entries.length === 0) return null;

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Raid-progress</h2>
      </div>
      <ul className="raid-list">
        {entries.map(([slug, r]) => {
          const pct = (r.mythic_bosses_killed / r.total_bosses) * 100;
          return (
            <li key={slug}>
              <div className="raid-top">
                <span>{titleFromSlug(slug)}</span>
                <span className="raid-summary">{r.summary}</span>
              </div>
              <span className="raid-track" aria-hidden>
                <span className="raid-bar" style={{ width: `${pct}%` }} />
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function BestRuns({ runs }: { runs: BestRun[] }) {
  if (runs.length === 0) return null;
  const sorted = [...runs].sort((a, b) => b.mythic_level - a.mythic_level || b.score - a.score);

  return (
    <section className="panel runs-panel">
      <div className="panel-head">
        <h2>Bästa runs per dungeon</h2>
      </div>
      <div className="best-runs">
        {sorted.map((r) => {
          const timed = r.num_keystone_upgrades > 0;
          return (
            <a
              key={r.keystone_run_id}
              className="best-run"
              href={r.url}
              target="_blank"
              rel="noreferrer"
              style={{ backgroundImage: `url("${cdnUrl(r.background_image_url)}")` }}
            >
              <span className="best-run-top">
                <span className="best-run-dungeon">{r.dungeon}</span>
                <span className={`best-run-level${timed ? '' : ' depleted'}`}>
                  +{r.mythic_level}
                  {timed && <span className="chests">{'★'.repeat(r.num_keystone_upgrades)}</span>}
                </span>
              </span>
              <span className="best-run-bottom">
                <span>{formatDuration(r.clear_time_ms)} <span className="muted">/ {formatDuration(r.par_time_ms)}</span></span>
                <span className="best-run-score">{r.score.toFixed(1)}</span>
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}

function RecentRuns({ runs }: { runs: BestRun[] }) {
  if (runs.length === 0) return null;
  return (
    <section className="panel runs-panel">
      <div className="panel-head">
        <h2>Senaste runs</h2>
      </div>
      <div className="table-wrap">
        <table className="runs compact">
          <thead>
            <tr>
              <th>Dungeon</th>
              <th>Nyckel</th>
              <th>Tid</th>
              <th>Spec</th>
              <th className="num">Poäng</th>
              <th className="num">Datum</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((r) => {
              const timed = r.num_keystone_upgrades > 0;
              return (
                <tr key={r.keystone_run_id}>
                  <td>
                    <span className="dungeon-cell">
                      <img src={cdnUrl(r.icon_url)} alt="" width={24} height={24} loading="lazy" />
                      <a href={r.url} target="_blank" rel="noreferrer">{r.dungeon}</a>
                    </span>
                  </td>
                  <td>
                    <span className="key-level">+{r.mythic_level}</span>
                    {timed && <span className="chests">{'★'.repeat(r.num_keystone_upgrades)}</span>}
                  </td>
                  <td className="time-cell">
                    <span className={timed ? 'remaining' : 'remaining over'}>
                      {formatDuration(r.clear_time_ms)}
                    </span>
                  </td>
                  <td className="muted">{r.spec?.name ?? '–'}</td>
                  <td className="num score">{r.score.toFixed(1)}</td>
                  <td className="num muted">{formatDate(r.completed_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
