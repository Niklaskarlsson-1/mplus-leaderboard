import type { Role } from '../lib/types.ts';
import { ROLE_LABELS } from '../lib/wow.ts';

/** Små ikoner för roller: sköld (tank), kors (healer), svärd (dps). */
export function RoleIcon({ role }: { role: Role }) {
  return (
    <svg
      className={`role-icon role-${role}`}
      viewBox="0 0 16 16"
      width="14"
      height="14"
      role="img"
      aria-label={ROLE_LABELS[role]}
    >
      <title>{ROLE_LABELS[role]}</title>
      {role === 'tank' && (
        <path d="M8 1.5 2.5 3.5v4c0 3.3 2.3 5.9 5.5 7 3.2-1.1 5.5-3.7 5.5-7v-4L8 1.5Z" fill="currentColor" />
      )}
      {role === 'healer' && (
        <path d="M6 2h4v4h4v4h-4v4H6v-4H2V6h4V2Z" fill="currentColor" />
      )}
      {role === 'dps' && (
        <path
          d="M13.5 1.5 14.5 2.5 7 10l1.5 1.5-1 1L6 11l-2.5 2.5.8.8-1 1-2.5-2.5 1-1 .8.8L5 10 3.5 8.5l1-1L6 9l7.5-7.5Z"
          fill="currentColor"
        />
      )}
    </svg>
  );
}
