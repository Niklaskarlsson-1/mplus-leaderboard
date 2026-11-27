import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ROUTER_FUTURE } from '../lib/router.ts';
import type { Ranking } from '../lib/types.ts';
import { makeMember, makeRanking } from '../test/fixtures.ts';
import { RunsTable } from './RunsTable.tsx';

// RunsTable innehåller <Link>, som kräver en router runt sig.
function renderTable(rankings: Ranking[]) {
  return render(
    <MemoryRouter future={ROUTER_FUTURE}>
      <RunsTable rankings={rankings} />
    </MemoryRouter>
  );
}

const bodyRows = () => screen.getAllByRole('row').slice(1); // första raden är rubriker

describe('RunsTable', () => {
  it('visar ett meddelande när listan är tom', () => {
    renderTable([]);

    expect(screen.getByText('Inga runs hittades för det här filtret.')).toBeInTheDocument();
  });

  it('visar nyckel, dungeon, poäng och tid för varje run', () => {
    renderTable([makeRanking({ level: 25, score: 561.34, dungeon: 'Murder Row', chests: 2 })]);

    const row = bodyRows()[0];
    expect(within(row).getByText('+25')).toBeInTheDocument();
    expect(within(row).getByText('★★')).toBeInTheDocument();
    expect(within(row).getByText('Murder Row')).toBeInTheDocument();
    expect(within(row).getByText('561.3')).toBeInTheDocument();
    expect(within(row).getByText('1:40 kvar')).toBeInTheDocument();
  });

  it('visar "över" för en run som inte klarades i tid', () => {
    renderTable([makeRanking({ chests: 0 })]);

    expect(screen.getByText('1:00 över')).toBeInTheDocument();
  });

  it('länkar varje spelare till karaktärssidan', () => {
    const member = makeMember({ name: 'Rooiben' });
    renderTable([makeRanking({ roster: [member] })]);

    expect(screen.getByRole('link', { name: /Rooiben/ })).toHaveAttribute(
      'href',
      '/character/eu/sylvanas/Rooiben'
    );
  });

  it('sorterar gruppen som tank, healer och sist dps', () => {
    const roster = [
      makeMember({ name: 'Dps', role: 'dps' }),
      makeMember({ name: 'Healer', role: 'healer' }),
      makeMember({ name: 'Tank', role: 'tank' }),
    ];
    renderTable([makeRanking({ roster })]);

    const names = screen.getAllByRole('link').map((a) => a.textContent);
    expect(names).toEqual(['TankTank', 'HealerHealer', 'DPSDps']); // rollikonens namn + spelarens namn
  });

  it('visar 20 runs åt gången och fler när man klickar på "Visa fler"', async () => {
    const rankings = Array.from({ length: 45 }, (_, i) => makeRanking({ rank: i + 1 }));
    renderTable(rankings);

    expect(bodyRows()).toHaveLength(20);
    expect(screen.getByText('Visar 20 av 45')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Visa fler' }));
    expect(bodyRows()).toHaveLength(40);

    await userEvent.click(screen.getByRole('button', { name: 'Visa fler' }));
    expect(bodyRows()).toHaveLength(45);
    expect(screen.queryByRole('button', { name: 'Visa fler' })).not.toBeInTheDocument();
  });
});
