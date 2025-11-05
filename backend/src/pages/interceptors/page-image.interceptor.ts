import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { Page } from '@prisma/client';
import { IStorageService } from '@/core/interfaces/storage.interface';
import { ImageGeneratorService } from '@/infrastructure/storage/image-generator.service';
import { PrismaService } from '@/../prisma/prisma.service';

/**
 * Interceptor que garante que toda página tenha avatar e banner válidos.
 * Implementa padrão "Auto-Healing":
 * - Se avatarUrl/bannerUrl for null, gera imagem padrão
 * - Se arquivo não existir no storage, gera novo
 * - Atualiza banco automaticamente
 * - Usa pageId (não userId) para paths
 */
@Injectable()
export class PageImageInterceptor implements NestInterceptor {
  constructor(
    @Inject('IStorageService') private readonly storage: IStorageService,
    private readonly imageGenerator: ImageGeneratorService,
    private readonly prisma: PrismaService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      switchMap((data) => {
        console.log('[PageImageInterceptor] Interceptor executado');
        console.log('[PageImageInterceptor] data type:', typeof data);
        console.log('[PageImageInterceptor] data keys:', data ? Object.keys(data) : 'null');
        console.log('[PageImageInterceptor] data.id:', data?.id);
        console.log('[PageImageInterceptor] data.name:', data?.name);
        console.log('[PageImageInterceptor] data.slug:', data?.slug);
        console.log('[PageImageInterceptor] data.ownerId:', data?.ownerId);
        console.log('[PageImageInterceptor] isPage?:', this.isPage(data));

        // Se não for uma página, retorna sem modificar
        if (!data || !this.isPage(data)) {
          console.log('[PageImageInterceptor] Não é uma página, pulando...');
          return from(Promise.resolve(data));
        }

        console.log('[PageImageInterceptor] É uma página! Iniciando healing...');
        // Processa a página de forma assíncrona
        return from(this.healPageImages(data as Page));
      }),
    );
  }

  /**
   * Verifica e corrige imagens da página.
   */
  private async healPageImages(page: any): Promise<any> {
    console.log('[PageImageInterceptor] healPageImages iniciado');
    console.log('[PageImageInterceptor] page.id:', page.id);
    console.log('[PageImageInterceptor] page.avatarUrl:', page.avatarUrl);
    console.log('[PageImageInterceptor] page.bannerUrl:', page.bannerUrl);

    // Busca a página completa do banco (o DTO não tem ownerId)
    const fullPage = await this.prisma.page.findUnique({
      where: { id: page.id },
    });

    if (!fullPage) {
      console.log('[PageImageInterceptor] Página não encontrada no banco!');
      return page;
    }

    let needsUpdate = false;
    const updateData: Partial<Page> = {};

    // Verifica e corrige avatar
    const avatarNeedsHealing = await this.needsHealing(
      page.avatarUrl,
      `avatars/${page.id}`,
    );

    console.log('[PageImageInterceptor] avatarNeedsHealing:', avatarNeedsHealing);

    if (avatarNeedsHealing) {
      console.log(`[PageImageInterceptor] Gerando avatar para página ${page.id}`);
      const avatarUrl = await this.generateAndSaveAvatar(fullPage);
      console.log('[PageImageInterceptor] Avatar gerado:', avatarUrl);
      updateData.avatarUrl = avatarUrl;
      needsUpdate = true;
    }

    // Verifica e corrige banner
    const bannerNeedsHealing = await this.needsHealing(
      page.bannerUrl,
      `banners/${page.id}`,
    );

    console.log('[PageImageInterceptor] bannerNeedsHealing:', bannerNeedsHealing);

    if (bannerNeedsHealing) {
      console.log(`[PageImageInterceptor] Gerando banner para página ${page.id}`);
      const bannerUrl = await this.generateAndSaveBanner(fullPage);
      console.log('[PageImageInterceptor] Banner gerado:', bannerUrl);
      updateData.bannerUrl = bannerUrl;
      needsUpdate = true;
    }

    // Atualiza banco se necessário
    if (needsUpdate) {
      console.log('[PageImageInterceptor] Atualizando banco com:', updateData);
      await this.prisma.page.update({
        where: { id: page.id },
        data: updateData,
      });

      console.log('[PageImageInterceptor] Banco atualizado!');
      // Retorna o DTO original com as URLs atualizadas
      return { ...page, ...updateData };
    }

    console.log('[PageImageInterceptor] Nenhuma atualização necessária');
    return page;
  }

  /**
   * Verifica se imagem precisa ser gerada/regenerada.
   */
  private async needsHealing(
    url: string | null | undefined,
    pathPrefix: string,
  ): Promise<boolean> {
    // Se URL não existe, precisa gerar
    if (!url) return true;

    // Extrai path relativo da URL
    // Ex: http://localhost:3000/uploads/avatars/123/avatar.svg?v=123 -> avatars/123/avatar.svg
    const urlMatch = url.match(/\/uploads\/(.+?)(\?|$)/);
    if (!urlMatch) return true;

    const relativePath = urlMatch[1];

    // Verifica se arquivo existe no storage
    const exists = await this.storage.exists(relativePath);

    return !exists;
  }

  /**
   * Gera e salva avatar padrão.
   * Baixa da DiceBear API e salva localmente.
   */
  private async generateAndSaveAvatar(page: Page): Promise<string> {
    try {
      // Obtém URL da API DiceBear (mesmo método do frontend)
      const avatarUrl = this.imageGenerator.getDefaultAvatarUrl(page.name);

      console.log('[PageImageInterceptor] Baixando avatar de:', avatarUrl);

      // Baixa a imagem SVG
      const response = await fetch(avatarUrl);
      if (!response.ok) {
        throw new Error(`Falha ao baixar avatar: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Salva no storage local
      const filePath = `avatars/${page.id}/avatar.svg`;
      const version = Date.now();

      await this.storage.upload(filePath, buffer, 'image/svg+xml');

      return this.storage.getPublicUrl(filePath, version);
    } catch (error) {
      console.error('[PageImageInterceptor] Erro ao gerar avatar:', error);
      // Retorna URL de fallback se falhar (usa API diretamente)
      return this.getFallbackAvatarUrl(page.name);
    }
  }

  /**
   * Gera e salva banner padrão.
   * Cria SVG gradiente e salva localmente.
   */
  private async generateAndSaveBanner(page: Page): Promise<string> {
    try {
      // Gera SVG gradiente (mesmo método do frontend)
      const buffer = this.imageGenerator.generateDefaultBanner(page.name);

      // Salva no storage local
      const filePath = `banners/${page.id}/banner.svg`;
      const version = Date.now();

      await this.storage.upload(filePath, buffer, 'image/svg+xml');

      return this.storage.getPublicUrl(filePath, version);
    } catch (error) {
      console.error('[PageImageInterceptor] Erro ao gerar banner:', error);
      // Retorna URL de fallback se falhar
      return this.getFallbackBannerUrl(page.name);
    }
  }

  /**
   * Verifica se objeto é uma Page ou PageDTO.
   * O DTO não tem ownerId (foi removido pelo controller).
   */
  private isPage(obj: any): obj is Page {
    return (
      obj &&
      typeof obj === 'object' &&
      'id' in obj &&
      'name' in obj &&
      'slug' in obj
      // Não verifica ownerId pois o DTO não tem
    );
  }

  /**
   * URL de fallback caso API externa falhe (usa DiceBear direto).
   */
  private getFallbackAvatarUrl(seed: string): string {
    const encodedSeed = encodeURIComponent(seed);
    return `https://api.dicebear.com/9.x/initials/svg?seed=${encodedSeed}&size=128`;
  }

  /**
   * URL de fallback para banner (gradiente simples).
   */
  private getFallbackBannerUrl(seed: string): string {
    // Retorna data URL de SVG gradiente simples
    const svg = `<svg width="2560" height="1440" xmlns="http://www.w3.org/2000/svg"><rect width="2560" height="1440" fill="%234f46e5"/></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }
}
