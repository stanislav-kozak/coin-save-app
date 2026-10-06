import { describe, expect, it } from 'vitest';
import { loginSchema, resetPasswordSchema, signupSchema } from './schemas';

const firstIssue = (r: { error?: { issues: { message: string; path: PropertyKey[] }[] } }) =>
  r.error?.issues[0];

describe('auth schemas', () => {
  it('trims the email', () => {
    expect(loginSchema.parse({ email: '  a@b.co ', password: 'x' }).email).toBe('a@b.co');
  });

  it('rejects an invalid email with a validation key', () => {
    expect(firstIssue(loginSchema.safeParse({ email: 'nope', password: 'x' }))?.message).toBe(
      'emailInvalid',
    );
  });

  it('requires a password on login', () => {
    expect(firstIssue(loginSchema.safeParse({ email: 'a@b.co', password: '' }))?.message).toBe(
      'required',
    );
  });

  it('requires 8+ characters for a new password', () => {
    const r = signupSchema.safeParse({ email: 'a@b.co', password: '1234567', name: '' });
    expect(firstIssue(r)?.message).toBe('passwordTooShort');
  });

  it('turns a blank name into undefined and trims a real one', () => {
    expect(
      signupSchema.parse({ email: 'a@b.co', password: '12345678', name: '   ' }).name,
    ).toBeUndefined();
    expect(
      signupSchema.parse({ email: 'a@b.co', password: '12345678', name: ' Taras ' }).name,
    ).toBe('Taras');
  });

  it('limits the name to 100 characters', () => {
    const r = signupSchema.safeParse({
      email: 'a@b.co',
      password: '12345678',
      name: 'x'.repeat(101),
    });
    expect(firstIssue(r)?.message).toBe('nameTooLong');
  });

  it('requires matching passwords on reset', () => {
    const r = resetPasswordSchema.safeParse({
      newPassword: '12345678',
      confirmPassword: '12345679',
    });
    expect(firstIssue(r)?.message).toBe('passwordsMismatch');
    expect(firstIssue(r)?.path).toEqual(['confirmPassword']);
  });
});
