import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FormField } from './form-field';
import { Input } from './input';

describe('FormField', () => {
  it('labels its control', () => {
    render(
      <FormField id="email" label="Email">
        <Input id="email" />
      </FormField>,
    );
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('shows the error as an alert linked to the control', () => {
    render(
      <FormField id="email" label="Email" error="Bad email">
        <Input id="email" aria-invalid aria-describedby="email-error" />
      </FormField>,
    );
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Bad email');
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-describedby', alert.id);
  });
});
