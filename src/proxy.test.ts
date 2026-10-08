// @vitest-environment node
import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import proxy from './proxy';

function visit(path: string, headers: Record<string, string> = {}) {
  return proxy(new NextRequest(new URL(path, 'https://app.coinsavekeeper.com'), { headers }));
}

const target = (res: Response) => new URL(res.headers.get('location') ?? '').pathname;

describe('proxy — language', () => {
  it('opens in English by default, even for a Ukrainian browser', () => {
    expect(target(visit('/', { cookie: 'session=1', 'accept-language': 'uk-UA,uk;q=0.9' }))).toBe(
      '/en',
    );
    expect(target(visit('/login', { 'accept-language': 'uk' }))).toBe('/en/login');
  });

  it("keeps the language the user chose (the switcher's cookie)", () => {
    expect(
      target(visit('/', { cookie: 'session=1; NEXT_LOCALE=uk', 'accept-language': 'en' })),
    ).toBe('/uk');
  });

  it('keeps a language that is in the address', () => {
    const res = visit('/uk/login', { 'accept-language': 'en' });
    expect(res.headers.get('location')).toBeNull();
  });
});
