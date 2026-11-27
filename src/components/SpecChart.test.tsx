import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { makeMember, makeRanking } from '../test/fixtures.ts';
import { SpecChart } from './SpecChart.tsx';

const frost = () => makeMember({ role: 'dps', spec: 'Frost' });
const fire = () => makeMember({ role: 'dps', spec: 'Fire' });
const disc = () =>
  makeMember({ role: 'healer', classSlug: 'priest', className: 'Priest', spec: 'Discipline' });

const rankings = [
  makeRanking({ roster: [frost(), disc()] }),
  makeRanking({ roster: [frost(), disc()] }),
  makeRanking({ roster: [fire(), disc()] }),
  makeRanking({ roster: [frost(), disc()] }),
];

describe('SpecChart', () => {
  it('visar DPS som standard med andel av alla runs', () => {
    render(<SpecChart rankings={rankings} />);

    expect(screen.getByText('Andel av topp 4 runs där specen finns med')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /DPS/ })).toHaveAttribute('aria-checked', 'true');

    const rows = screen.getAllByRole('listitem');
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent('Frost');
    expect(rows[0]).toHaveTextContent('75 %');
    expect(rows[1]).toHaveTextContent('Fire');
    expect(rows[1]).toHaveTextContent('25 %');
  });

  it('byter till healers när man väljer rollen', async () => {
    render(<SpecChart rankings={rankings} />);

    await userEvent.click(screen.getByRole('radio', { name: /Healer/ }));

    const rows = screen.getAllByRole('listitem');
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveTextContent('Discipline');
    expect(rows[0]).toHaveTextContent('100 %');
  });

  it('visar en tooltip med exakta siffror när man håller musen över en stapel', async () => {
    render(<SpecChart rankings={rankings} />);

    await userEvent.hover(screen.getAllByRole('listitem')[0]);

    expect(screen.getByRole('tooltip')).toHaveTextContent('3 av 4 runs · 75 %');
  });

  it('visar inget när det saknas data', () => {
    const { container } = render(<SpecChart rankings={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
