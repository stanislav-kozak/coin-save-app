import { describe, expect, it } from 'vitest';

describe('test runner', () => {
  it('runs with jsdom', () => {
    document.body.innerHTML = '<p>ok</p>';
    expect(document.querySelector('p')).toHaveTextContent('ok');
  });
});
