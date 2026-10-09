import { render } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { expect, it } from 'vitest';
import { CountUpMoney } from './count-up-money';

it('gives screen readers the final amount once', () => {
  const { container } = render(
    <NextIntlClientProvider locale="uk" messages={{}}>
      <CountUpMoney value="1250.5" currency="UAH" />
    </NextIntlClientProvider>,
  );
  expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent(/1\s250,50\s₴/);
  expect(container.querySelector('.sr-only')).toHaveTextContent(/1\s250,50\s₴/);
});
