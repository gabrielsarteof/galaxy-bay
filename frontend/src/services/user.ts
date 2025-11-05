import api from '@/services/api';

// Tipo genérico para o perfil do usuário
type UserProfile = {
  address: string;
  [key: string]: unknown;
}

// src/services/user.ts
export async function fetchUserProfile(): Promise<UserProfile> {
  const { data } = await api.get<UserProfile>('/users/profile');
  return data;
}
