import axios from 'axios';
import api from './api';
import type { components } from '@/types/api-schema';

type PageResponseDto = components['schemas']['PageResponseDto'];
type CreatePageDto = components['schemas']['CreatePageDto'];

export async function createPage(input: CreatePageDto): Promise<PageResponseDto> {
  const { data } = await api.post<PageResponseDto>('/page', input);
  return data;
}

export async function getMyPage(): Promise<PageResponseDto | null> {
  try {
    const { data } = await api.get<PageResponseDto>('/page');
    return data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return null;
    }
    throw err;
  }
}

export async function updatePage(
  id: string,
  payload: Partial<components['schemas']['CreatePageDto']> | FormData
): Promise<PageResponseDto> {
  if (payload instanceof FormData) {
    const { data } = await api.put<PageResponseDto>(
      `/page/${id}/upload-images`,
      payload,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  }
  const { data } = await api.put<PageResponseDto>(
    `/page/${id}`,
    payload
  );
  return data;
}

// Novo método para buscar página pública via slug
export async function getPageBySlug(slug: string): Promise<PageResponseDto> {
  const { data } = await api.get<PageResponseDto>(`/page/by-slug/${slug}`);
  return data;
}

/**
 * Busca estatísticas agregadas da página incluindo NFTs destacadas e atividades recentes
 */
export async function getPageStats(slug: string) {
  const { data } = await api.get(`/page/slug/${slug}/stats`);
  return data;
}

/**
 * Busca estatísticas da comunidade incluindo holders e volume
 */
export async function getPageCommunity(slug: string) {
  const { data } = await api.get(`/page/slug/${slug}/community`);
  return data;
}

export interface DiscoverPageParams {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'recent' | 'popular' | 'volume' | 'name';
}

export interface DiscoverPageResponse {
  data: PageResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export async function discoverPages(params: DiscoverPageParams = {}): Promise<DiscoverPageResponse> {
  const { data } = await api.get<DiscoverPageResponse>('/page/discover', { params });
  return data;
}

export async function getTrendingPages(limit: number = 5): Promise<PageResponseDto[]> {
  const { data } = await api.get<PageResponseDto[]>('/page/trending', {
    params: { limit },
  });
  return data;
}

export async function getPageCategories(): Promise<string[]> {
  const { data } = await api.get<string[]>('/page/categories');
  return data;
}
