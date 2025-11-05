// frontend/src/services/api.ts
import axios from 'axios';
import type { paths } from '@/types/api-schema';

export type CreateMetadataDto =
  paths['/nfts/generate-metadata']['post']['requestBody']['content']['application/json'];
export type RegisterNftDto =
  paths['/nfts/register']['post']['requestBody']['content']['application/json'];
type RegisterUserDto =
  paths['/auth/register']['post']['requestBody']['content']['application/json'];

type RequestNonceResponse =
  paths['/auth/request-nonce']['post']['responses']['200']['content']['application/json'];
export type LoginResponse =
  paths['/auth/login']['post']['responses']['200']['content']['application/json'];


const api = axios.create({
  baseURL: 'http://localhost:3000/api/',
});

api.interceptors.request.use(config => {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('accessToken')
    : null;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Interceptor de resposta para tratamento centralizado de erros.
 * Captura erro 401 (Unauthorized) e remove token inválido do localStorage.
 */
api.interceptors.response.use(
  response => response,
  error => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');

        if (!window.location.pathname.includes('/auth/login')) {
          window.location.href = '/auth/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export async function requestNonce(
  address: string
): Promise<RequestNonceResponse> {
  const res = await api.post<RequestNonceResponse>(
    '/auth/request-nonce',
    { address }
  );
  return res.data;
}

export async function login(address: string, signature: string) {
  const res = await api.post('/auth/login', { address, signature });
  
  // Mapeamento da resposta
  const data = res.data;
  const formattedData = {
    accessToken: data.access_token,  
  };

  return formattedData;
}

export async function registerUser(
  payload: RegisterUserDto
): Promise<unknown> {
  const res = await api.post<unknown>(
    '/auth/register',
    payload
  );
  return res.data;
}

export async function generateMetadata(data: {
  name: string;
  description?: string;
  image: string;
}) {
  const res = await fetch('/api/nfts/generate-metadata', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json() as Promise<{ metadataUrl: string }>;
}

export async function registerNft(data: {
  ownerAddress: string;
  metadataUrl: string;
  tokenId: string;
  transactionHash: string;
  blockHash: string;
  price: number;
}) {
  const res = await fetch('/api/nfts/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export default api;
