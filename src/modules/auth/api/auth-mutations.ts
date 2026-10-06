import { useMutation } from '@tanstack/react-query';
import type { components } from '@/generated/api';
import { api } from '@/shared/lib/api-client';

type Schemas = components['schemas'];

export function useLogin() {
  return useMutation({
    mutationFn: async (body: Schemas['LoginDto']) => {
      const { data, error } = await api.POST('/api/auth/login', { body });
      if (error) throw error;
      return data;
    },
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: async (body: Schemas['SignupDto']) => {
      const { data, error } = await api.POST('/api/auth/signup', { body });
      if (error) throw error;
      return data;
    },
  });
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: async (body: Schemas['RequestPasswordResetDto']) => {
      const { data, error } = await api.POST('/api/auth/request-password-reset', { body });
      if (error) throw error;
      return data;
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async (body: Schemas['ResetPasswordDto']) => {
      const { data, error } = await api.POST('/api/auth/reset-password', { body });
      if (error) throw error;
      return data;
    },
  });
}
