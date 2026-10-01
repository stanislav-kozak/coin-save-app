import { describe, expect, it } from 'vitest';
import { getErrorCode } from './api-error';

describe('getErrorCode', () => {
  it('returns a code that has a translation', () => {
    expect(
      getErrorCode({ statusCode: 404, code: 'WALLET_NOT_FOUND', message: 'Wallet not found' }),
    ).toBe('WALLET_NOT_FOUND');
  });

  it.each([
    ['an unknown code', { statusCode: 400, code: 'SOMETHING_NEW', message: 'x' }],
    ['a non-JSON body (proxy HTML page)', '<html>502 Bad Gateway</html>'],
    ['undefined', undefined],
    ['null', null],
    ['an object without code', { message: 'boom' }],
    ['a non-string code', { code: 42 }],
  ])('falls back to UNKNOWN_ERROR for %s', (_label, error) => {
    expect(getErrorCode(error)).toBe('UNKNOWN_ERROR');
  });
});
