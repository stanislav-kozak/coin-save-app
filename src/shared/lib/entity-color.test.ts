import { expect, it } from 'vitest';
import { entityStyle } from './entity-color';

it('exposes a valid entity colour as --entity only', () => {
  expect(entityStyle('#A855F7')).toEqual({ '--entity': '#A855F7' });
  expect(entityStyle('red; background:url(x)')).toBeUndefined();
  expect(entityStyle(null)).toBeUndefined();
});
