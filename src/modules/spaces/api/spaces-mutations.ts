import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { components } from '@/generated/api';
import { api } from '@/shared/lib/api-client';
import { lastSpace } from '../lib/last-space';

type Invite = components['schemas']['InviteMemberDto'];

export function useUpdateSpace(spaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { name: string }) => {
      const { data, error } = await api.PATCH('/api/spaces/{spaceId}', {
        params: { path: { spaceId } },
        body,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['spaces'], exact: true }),
        queryClient.invalidateQueries({ queryKey: ['spaces', spaceId] }),
      ]),
  });
}

/** After deleting or leaving: drop the space's cache, never land on it again, refresh the list. */
function useForgetSpace(spaceId: string) {
  const queryClient = useQueryClient();
  return () => {
    lastSpace.forget(spaceId);
    queryClient.removeQueries({ queryKey: ['spaces', spaceId] });
    return queryClient.invalidateQueries({ queryKey: ['spaces'], exact: true });
  };
}

export function useDeleteSpace(spaceId: string) {
  const forget = useForgetSpace(spaceId);
  return useMutation({
    mutationFn: async () => {
      const { error } = await api.DELETE('/api/spaces/{spaceId}', {
        params: { path: { spaceId } },
      });
      if (error) throw error;
    },
    onSuccess: forget,
  });
}

export function useLeaveSpace(spaceId: string) {
  const forget = useForgetSpace(spaceId);
  return useMutation({
    mutationFn: async () => {
      const { error } = await api.POST('/api/spaces/{spaceId}/leave', {
        params: { path: { spaceId } },
      });
      if (error) throw error;
    },
    onSuccess: forget,
  });
}

export function useMembers(spaceId: string) {
  return useQuery({
    queryKey: ['members', spaceId],
    queryFn: async () => {
      const { data, error } = await api.GET('/api/spaces/{spaceId}/members', {
        params: { path: { spaceId } },
      });
      if (error) throw error;
      return data;
    },
  });
}

export function useRemoveMember(spaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (membershipId: string) => {
      const { error } = await api.DELETE('/api/spaces/{spaceId}/members/{membershipId}', {
        params: { path: { spaceId, membershipId } },
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['members', spaceId] }),
  });
}

export function useInvitations(spaceId: string) {
  return useQuery({
    queryKey: ['invitations', spaceId],
    queryFn: async () => {
      const { data, error } = await api.GET('/api/spaces/{spaceId}/invitations', {
        params: { path: { spaceId } },
      });
      if (error) throw error;
      return data;
    },
  });
}

export function useInvite(spaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: Invite) => {
      const { data, error } = await api.POST('/api/spaces/{spaceId}/invitations', {
        params: { path: { spaceId } },
        body,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invitations', spaceId] }),
  });
}

export function useRevokeInvitation(spaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await api.DELETE('/api/spaces/{spaceId}/invitations/{invitationId}', {
        params: { path: { spaceId, invitationId } },
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invitations', spaceId] }),
  });
}

/** Joins the space from an email link; resolves to the new membership (its `spaceId`). */
export function useAcceptInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (token: string) => {
      const { data, error } = await api.POST('/api/invitations/accept', { body: { token } });
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['spaces'], exact: true }),
  });
}
