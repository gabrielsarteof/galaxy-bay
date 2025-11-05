import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import sharp from 'sharp';

const prisma = new PrismaClient();

/**
 * Script de migração para converter todas as imagens SVG existentes para PNG.
 *
 * Este script:
 * 1. Busca todas as páginas no banco de dados
 * 2. Para cada imagem (avatar/banner) que termina com .svg:
 *    - Converte o arquivo para PNG
 *    - Atualiza a URL no banco de dados
 *    - Remove o arquivo SVG antigo
 * 3. Loga todas as operações realizadas
 */

interface MigrationStats {
  totalPages: number;
  avatarsMigrated: number;
  bannersMigrated: number;
  errors: Array<{ pageId: string; type: string; error: string }>;
}

const stats: MigrationStats = {
  totalPages: 0,
  avatarsMigrated: 0,
  bannersMigrated: 0,
  errors: [],
};

// Caminho base do storage (relativo ao projeto)
const STORAGE_ROOT = join(process.cwd(), '..', 'storage');

/**
 * Converte SVG para PNG com dimensões específicas para avatar.
 */
async function convertAvatarToPng(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(512, 512, {
      fit: 'cover',
      position: 'center',
    })
    .png({
      quality: 90,
      compressionLevel: 9,
    })
    .toBuffer();
}

/**
 * Converte SVG para PNG com dimensões específicas para banner.
 */
async function convertBannerToPng(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(2560, 1440, {
      fit: 'cover',
      position: 'center',
    })
    .png({
      quality: 90,
      compressionLevel: 9,
    })
    .toBuffer();
}

/**
 * Extrai o caminho relativo do arquivo a partir da URL pública.
 * Exemplo: http://localhost:3000/uploads/avatars/123/avatar.svg?v=123 -> avatars/123/avatar.svg
 */
function extractFilePathFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    // Remove /uploads/ do início
    const match = pathname.match(/\/uploads\/(.+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Converte um arquivo SVG para PNG no sistema de arquivos.
 */
async function migrateSvgFile(
  svgPath: string,
  type: 'avatar' | 'banner',
): Promise<string> {
  const fullSvgPath = join(STORAGE_ROOT, svgPath);
  const pngPath = svgPath.replace(/\.svg$/, '.png');
  const fullPngPath = join(STORAGE_ROOT, pngPath);

  // Verifica se o arquivo SVG existe
  try {
    await fs.access(fullSvgPath);
  } catch {
    throw new Error(`Arquivo SVG não encontrado: ${fullSvgPath}`);
  }

  // Lê o arquivo SVG
  const svgBuffer = await fs.readFile(fullSvgPath);

  // Converte para PNG
  const pngBuffer =
    type === 'avatar'
      ? await convertAvatarToPng(svgBuffer)
      : await convertBannerToPng(svgBuffer);

  // Garante que o diretório existe
  await fs.mkdir(dirname(fullPngPath), { recursive: true });

  // Salva o arquivo PNG
  await fs.writeFile(fullPngPath, pngBuffer);

  // Remove o arquivo SVG antigo
  await fs.unlink(fullSvgPath);

  return pngPath;
}

/**
 * Atualiza a URL da imagem no banco de dados.
 */
async function updateImageUrl(
  pageId: string,
  field: 'avatarUrl' | 'bannerUrl',
  newPath: string,
): Promise<void> {
  const version = Date.now();
  const publicUrl = `http://localhost:3000/uploads/${newPath}?v=${version}`;

  await prisma.page.update({
    where: { id: pageId },
    data: { [field]: publicUrl },
  });
}

/**
 * Processa uma única página, migrando suas imagens se necessário.
 */
async function migratePage(page: {
  id: string;
  name: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
}): Promise<void> {
  console.log(`\n📄 Processando página: ${page.name} (${page.id})`);

  // Migra avatar se necessário
  if (page.avatarUrl && page.avatarUrl.includes('.svg')) {
    try {
      const svgPath = extractFilePathFromUrl(page.avatarUrl);
      if (svgPath) {
        console.log(`  🔄 Migrando avatar: ${svgPath}`);
        const pngPath = await migrateSvgFile(svgPath, 'avatar');
        await updateImageUrl(page.id, 'avatarUrl', pngPath);
        console.log(`  ✅ Avatar migrado para: ${pngPath}`);
        stats.avatarsMigrated++;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`  ❌ Erro ao migrar avatar: ${errorMsg}`);
      stats.errors.push({
        pageId: page.id,
        type: 'avatar',
        error: errorMsg,
      });
    }
  } else if (page.avatarUrl) {
    console.log(`  ⏭️  Avatar já é PNG, pulando...`);
  }

  // Migra banner se necessário
  if (page.bannerUrl && page.bannerUrl.includes('.svg')) {
    try {
      const svgPath = extractFilePathFromUrl(page.bannerUrl);
      if (svgPath) {
        console.log(`  🔄 Migrando banner: ${svgPath}`);
        const pngPath = await migrateSvgFile(svgPath, 'banner');
        await updateImageUrl(page.id, 'bannerUrl', pngPath);
        console.log(`  ✅ Banner migrado para: ${pngPath}`);
        stats.bannersMigrated++;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`  ❌ Erro ao migrar banner: ${errorMsg}`);
      stats.errors.push({
        pageId: page.id,
        type: 'banner',
        error: errorMsg,
      });
    }
  } else if (page.bannerUrl) {
    console.log(`  ⏭️  Banner já é PNG, pulando...`);
  }
}

/**
 * Função principal de migração.
 */
async function main() {
  console.log('🚀 Iniciando migração de imagens SVG para PNG...\n');

  try {
    // Busca todas as páginas
    const pages = await prisma.page.findMany({
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        bannerUrl: true,
      },
    });

    stats.totalPages = pages.length;
    console.log(`📊 Total de páginas encontradas: ${pages.length}\n`);

    if (pages.length === 0) {
      console.log('ℹ️  Nenhuma página encontrada. Nada a fazer.');
      return;
    }

    // Processa cada página
    for (const page of pages) {
      await migratePage(page);
    }

    // Exibe estatísticas finais
    console.log('\n' + '='.repeat(60));
    console.log('📊 RELATÓRIO DE MIGRAÇÃO');
    console.log('='.repeat(60));
    console.log(`Total de páginas processadas: ${stats.totalPages}`);
    console.log(`Avatars migrados: ${stats.avatarsMigrated}`);
    console.log(`Banners migrados: ${stats.bannersMigrated}`);
    console.log(`Total de imagens migradas: ${stats.avatarsMigrated + stats.bannersMigrated}`);
    console.log(`Erros: ${stats.errors.length}`);

    if (stats.errors.length > 0) {
      console.log('\n❌ ERROS ENCONTRADOS:');
      stats.errors.forEach((error, index) => {
        console.log(`${index + 1}. Página ${error.pageId} (${error.type}): ${error.error}`);
      });
    }

    console.log('\n✅ Migração concluída!');
  } catch (error) {
    console.error('\n❌ Erro fatal durante a migração:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executa o script
main();
