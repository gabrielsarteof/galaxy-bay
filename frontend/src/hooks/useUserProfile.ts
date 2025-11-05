'use client'

import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query'
import { fetchUserProfile } from '@/services/user'
import { USER_PROFILE_KEY } from '@/constants/queryKeys'

// Tipo genérico para o perfil do usuário
type UserProfile = {
  address: string;
  [key: string]: unknown;
}

type ProfileQueryKey = typeof USER_PROFILE_KEY

export function useUserProfile(
  options?: UseQueryOptions<
    UserProfile,
    Error,
    UserProfile,
    ProfileQueryKey
  >
): UseQueryResult<UserProfile, Error> {
  return useQuery<
    UserProfile,
    Error,
    UserProfile,
    ProfileQueryKey
  >({
    queryKey: USER_PROFILE_KEY,
    queryFn: () => fetchUserProfile(),
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1,
    ...options,
  })
}
