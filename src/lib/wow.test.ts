import { describe, expect, it } from 'vitest';
import { classColor, classSlug, formatDuration, qualityColor, titleFromSlug } from './wow.ts';

describe('formatDuration', () => {
  it('visar minuter och sekunder', () => {
    expect(formatDuration(1_851_441)).toBe('30:51');
  });

  it('fyller ut sekunder med en nolla', () => {
    expect(formatDuration(65_000)).toBe('1:05');
  });

  it('klarar noll', () => {
    expect(formatDuration(0)).toBe('0:00');
  });

  it('avrundar nedåt till hela sekunder', () => {
    expect(formatDuration(59_999)).toBe('0:59');
  });
});

describe('classSlug', () => {
  it('gör om klassnamn till slug', () => {
    expect(classSlug('Paladin')).toBe('paladin');
    expect(classSlug('Death Knight')).toBe('death-knight');
    expect(classSlug('Demon Hunter')).toBe('demon-hunter');
  });
});

describe('classColor', () => {
  it('ger Blizzards klassfärg', () => {
    expect(classColor('paladin')).toBe('#F48CBA');
    expect(classColor(classSlug('Death Knight'))).toBe('#C41E3A');
  });

  it('har en neutral reservfärg för okända klasser', () => {
    expect(classColor('ny-klass')).toBe('#9aa3b8');
  });
});

describe('qualityColor', () => {
  it('ger lila för epic och vitt för okänd kvalitet', () => {
    expect(qualityColor(4)).toBe('#a335ee');
    expect(qualityColor(99)).toBe('#ffffff');
  });
});

describe('titleFromSlug', () => {
  it('gör om en slug till en rubrik', () => {
    expect(titleFromSlug('the-venomous-abyss')).toBe('The Venomous Abyss');
  });

  it('behåller småord med liten bokstav inuti namnet', () => {
    expect(titleFromSlug('den-of-the-dragon')).toBe('Den of the Dragon');
  });
});
