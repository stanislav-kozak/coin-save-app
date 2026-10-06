import { z } from 'zod';

// Messages are keys of `auth.validation` in messages/*.json.
export const emailField = z
  .string()
  .trim()
  .pipe(z.email({ error: 'emailInvalid' }));
const newPasswordField = z.string().min(8, { error: 'passwordTooShort' });

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, { error: 'required' }),
});

export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .max(100, { error: 'nameTooLong' })
    .transform((v) => v || undefined), // backend rejects an empty name — omit it instead
  email: emailField,
  password: newPasswordField,
});

export const forgotPasswordSchema = z.object({ email: emailField });

export const resetPasswordSchema = z
  .object({ newPassword: newPasswordField, confirmPassword: z.string() })
  .refine((v) => v.newPassword === v.confirmPassword, {
    error: 'passwordsMismatch',
    path: ['confirmPassword'],
  });

export type LoginValues = z.output<typeof loginSchema>;
export type SignupValues = z.output<typeof signupSchema>;
export type ForgotPasswordValues = z.output<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.output<typeof resetPasswordSchema>;
