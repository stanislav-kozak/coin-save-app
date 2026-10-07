import { describe, expect, it } from 'vitest';
import { isCurrent, parsePeriod, periodLabel, periodOf, shiftPeriod } from './period';

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);

describe('periodOf', () => {
  it('builds Monday-to-Sunday weeks, months, quarters and years (inclusive dates)', () => {
    expect(periodOf('week', d(2026, 10, 11))).toEqual({
      kind: 'week',
      from: '2026-10-05',
      to: '2026-10-11',
    });
    expect(periodOf('week', d(2026, 10, 5))).toMatchObject({
      from: '2026-10-05',
      to: '2026-10-11',
    });
    expect(periodOf('month', d(2028, 2, 10))).toMatchObject({
      from: '2028-02-01',
      to: '2028-02-29',
    });
    expect(periodOf('quarter', d(2026, 11, 20))).toMatchObject({
      from: '2026-10-01',
      to: '2026-12-31',
    });
    expect(periodOf('year', d(2026, 6, 1))).toMatchObject({ from: '2026-01-01', to: '2026-12-31' });
  });
});

describe('shiftPeriod / isCurrent', () => {
  it('moves by one period, across years', () => {
    expect(shiftPeriod(periodOf('month', d(2026, 1, 15)), -1)).toMatchObject({
      from: '2025-12-01',
      to: '2025-12-31',
    });
    expect(shiftPeriod(periodOf('quarter', d(2026, 11, 1)), 1)).toMatchObject({
      from: '2027-01-01',
      to: '2027-03-31',
    });
    expect(shiftPeriod(periodOf('week', d(2026, 1, 1)), -1)).toMatchObject({
      from: '2025-12-22',
      to: '2025-12-28',
    });
  });
  it('knows the period containing today', () => {
    expect(isCurrent(periodOf('month', d(2026, 10, 7)), d(2026, 10, 31))).toBe(true);
    expect(isCurrent(periodOf('month', d(2026, 9, 7)), d(2026, 10, 1))).toBe(false);
  });
});

describe('parsePeriod', () => {
  const now = d(2026, 10, 7);
  it('reads ?period&from, normalising to the period start', () => {
    expect(parsePeriod(new URLSearchParams('period=quarter&from=2026-08-15'), now)).toMatchObject({
      kind: 'quarter',
      from: '2026-07-01',
      to: '2026-09-30',
    });
  });
  it('falls back to the current month on missing or invalid input', () => {
    for (const q of ['', 'period=decade', 'from=2026-13-40', 'period=month&from=2026-02-30']) {
      expect(parsePeriod(new URLSearchParams(q), now)).toMatchObject({
        kind: 'month',
        from: '2026-10-01',
      });
    }
    // a valid kind with a bad date → the current period of that kind
    expect(parsePeriod(new URLSearchParams('period=week&from=nope'), now)).toMatchObject({
      kind: 'week',
      from: '2026-10-05',
    });
  });
});

describe('periodLabel', () => {
  const quarter = (n: number, year: number) => `Q${n}/${year}`; // UI text comes from messages
  it("names the period in the user's language", () => {
    expect(periodLabel(periodOf('month', d(2026, 6, 1)), 'uk', quarter)).toBe('Червень 2026');
    expect(periodLabel(periodOf('month', d(2026, 6, 1)), 'en', quarter)).toBe('June 2026');
    expect(periodLabel(periodOf('quarter', d(2026, 5, 1)), 'uk', quarter)).toBe('Q2/2026');
    expect(periodLabel(periodOf('year', d(2026, 5, 1)), 'en', quarter)).toBe('2026');
    // Intl puts thin no-break spaces around the dash
    expect(periodLabel(periodOf('week', d(2026, 10, 7)), 'en', quarter)).toMatch(
      /^Oct 5\s–\s11, 2026$/,
    );
  });
});
