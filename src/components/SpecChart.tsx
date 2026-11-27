import { useMemo, useState } from 'react';
import { countSpecs } from '../lib/stats.ts';
import type { Ranking, Role } from '../lib/types.ts';
import { classColor, ROLE_LABELS, ROLE_ORDER } from '../lib/wow.ts';
import { RoleIcon } from './RoleIcon.tsx';

const MAX_ROWS = 10;

export function SpecChart({ rankings }: { rankings: Ranking[] }) {
  const [role, setRole] = useState<Role>('dps');
  const [hovered, setHovered] = useState<string | null>(null);

  const stats = useMemo(() => countSpecs(rankings, role), [rankings, role]);
  const total = rankings.length;
  const rows = stats.slice(0, MAX_ROWS);
  const rest = stats.length - rows.length;

  if (total === 0) return null;

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>Populäraste specs</h2>
          <p className="muted small">Andel av topp {total} runs där specen finns med</p>
        </div>
        <div className="segmented" role="radiogroup" aria-label="Roll">
          {ROLE_ORDER.map((r) => (
            <button
              key={r}
              role="radio"
              aria-checked={role === r}
              className={role === r ? 'active' : ''}
              onClick={() => setRole(r)}
            >
              <RoleIcon role={r} /> {ROLE_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      <ol className="spec-bars">
        {rows.map((s) => {
          const pct = (s.runs / total) * 100;
          const active = hovered === s.key;
          return (
            <li
              key={s.key}
              className={`spec-row${active ? ' hovered' : ''}${hovered && !active ? ' dimmed' : ''}`}
              onMouseEnter={() => setHovered(s.key)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(s.key)}
              onBlur={() => setHovered(null)}
              tabIndex={0}
            >
              <span className="spec-label">
                <span className="swatch" style={{ background: classColor(s.classSlug) }} />
                <span>
                  {s.spec} <span className="muted">{s.className}</span>
                </span>
              </span>
              <span className="bar-track">
                <span className="bar" style={{ width: `${pct}%` }} />
                {active && (
                  <span className="tooltip" role="tooltip">
                    <strong>{s.spec} {s.className}</strong>
                    <span>{s.runs} av {total} runs · {pct.toFixed(0)} %</span>
                  </span>
                )}
              </span>
              <span className="bar-value">{pct.toFixed(0)} %</span>
            </li>
          );
        })}
      </ol>
      {rest > 0 && <p className="muted small">+ {rest} specs till med färre runs</p>}
    </section>
  );
}
