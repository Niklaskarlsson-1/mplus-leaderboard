import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cdnUrl, characterPath, PAGE_SIZE } from '../lib/api.ts';
import type { Ranking, RosterMember } from '../lib/types.ts';
import { classColor, formatDate, formatDuration, ROLE_ORDER } from '../lib/wow.ts';
import { RoleIcon } from './RoleIcon.tsx';

function sortRoster(roster: RosterMember[]): RosterMember[] {
  return [...roster].sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role));
}

function Member({ m }: { m: RosterMember }) {
  const c = m.character;
  return (
    <Link
      className="member"
      to={characterPath(c.region.slug, c.realm.slug, c.name)}
      title={`${c.name} – ${c.spec.name} ${c.class.name} (${c.realm.name}-${c.region.short_name})`}
    >
      <RoleIcon role={m.role} />
      <span className="member-name" style={{ color: classColor(c.class.slug) }}>{c.name}</span>
    </Link>
  );
}

export function RunsTable({ rankings }: { rankings: Ranking[] }) {
  const [visible, setVisible] = useState(PAGE_SIZE);

  if (rankings.length === 0) {
    return <p className="empty">Inga runs hittades för det här filtret.</p>;
  }

  const rows = rankings.slice(0, visible);

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Bästa runs</h2>
        <span className="muted">Visar {rows.length} av {rankings.length}</span>
      </div>

      <div className="table-wrap">
        <table className="runs">
          <thead>
            <tr>
              <th className="num">#</th>
              <th>Nyckel</th>
              <th>Dungeon</th>
              <th>Tid</th>
              <th>Grupp</th>
              <th className="num">Poäng</th>
              <th className="num">Datum</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ rank, score, run }) => {
              const timed = run.num_chests > 0;
              return (
                <tr key={run.keystone_run_id}>
                  <td className="num rank">
                    <span className={rank <= 3 ? `medal medal-${rank}` : ''}>{rank}</span>
                  </td>
                  <td>
                    <span className="key-level">+{run.mythic_level}</span>
                    {timed && (
                      <span className="chests" title={`Uppgraderad +${run.num_chests}`}>
                        {'★'.repeat(run.num_chests)}
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="dungeon-cell">
                      <img src={cdnUrl(run.dungeon.icon_url)} alt="" width={28} height={28} loading="lazy" />
                      <span>{run.dungeon.name}</span>
                    </span>
                  </td>
                  <td className="time-cell">
                    <span className="clear-time">{formatDuration(run.clear_time_ms)}</span>
                    <span className={timed ? 'remaining' : 'remaining over'}>
                      {formatDuration(Math.abs(run.time_remaining_ms))} {timed ? 'kvar' : 'över'}
                    </span>
                  </td>
                  <td>
                    <div className="roster">
                      {sortRoster(run.roster).map((m) => (
                        <Member key={m.character.id} m={m} />
                      ))}
                    </div>
                  </td>
                  <td className="num score">{score.toFixed(1)}</td>
                  <td className="num muted">{formatDate(run.completed_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {visible < rankings.length && (
        <button className="load-more" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
          Visa fler
        </button>
      )}
    </section>
  );
}
