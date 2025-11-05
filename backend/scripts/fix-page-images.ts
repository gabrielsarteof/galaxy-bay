/**
 * Script para regenerar imagens padrão de páginas que não possuem avatarUrl/bannerUrl.
 * Útil quando a geração falhou durante a criação da página.
 */

import { PrismaClient } from '@prisma/client';
import { ImageGeneratorService } from '../src/infrastructure/storage/image-generator.service';
import { LocalStorageService } from '../src/infrastructure/storage/local-storage.service';

const prisma = new PrismaClient();
const imageGenerator = new ImageGeneratorService();
const storage = new LocalStorageService();

async function fixPageImages() {
  try {
    console.log('🔧 Procurando páginas sem imagens...\n');

    const pages = await prisma.page.findMany({
      where: {
        OR: [
          { avatarUrl: null },
          { bannerUrl: null },
        ],
      },
    });

    if (pages.length === 0) {
      console.log('✅ Todas as páginas já possuem imagens!\n');
      return;
    }

    console.log(`📄 Encontradas ${pages.length} página(s) sem imagens:\n`);

    for (const page of pages) {
      console.log(`\n🎨 Gerando imagens para: ${page.name} (${page.slug})`);

      try {
        const version = Date.now();
        const updateData: any = {};

        // Gera avatar se não existir
        if (!page.avatarUrl) {
          console.log('  📸 Gerando avatar...');
          const avatarUrl = imageGenerator.getDefaultAvatarUrl(page.name);
          const avatarResponse = await fetch(avatarUrl);
          const avatarSvgBuffer = Buffer.from(await avatarResponse.arrayBuffer());
          const avatarPngBuffer = await imageGenerator.convertAvatarToPng(avatarSvgBuffer);
          const avatarPath = `avatars/${page.id}/avatar.png`;
          await storage.upload(avatarPath, avatarPngBuffer, 'image/png');
          updateData.avatarUrl = storage.getPublicUrl(avatarPath, version);
          console.log('  ✅ Avatar criado:', updateData.avatarUrl);
        }

        // Gera banner se não existir
        if (!page.bannerUrl) {
          console.log('  🖼️  Gerando banner...');
          const bannerSvgBuffer = imageGenerator.generateDefaultBanner(page.name);
          const bannerPngBuffer = await imageGenerator.convertBannerToPng(bannerSvgBuffer);
          const bannerPath = `banners/${page.id}/banner.png`;
          await storage.upload(bannerPath, bannerPngBuffer, 'image/png');
          updateData.bannerUrl = storage.getPublicUrl(bannerPath, version);
          console.log('  ✅ Banner criado:', updateData.bannerUrl);
        }

        // Atualiza página no banco
        if (Object.keys(updateData).length > 0) {
          await prisma.page.update({
            where: { id: page.id },
            data: updateData,
          });
          console.log('  ✅ Página atualizada no banco de dados!');
        }

      } catch (error) {
        console.error(`  ❌ Erro ao processar página ${page.name}:`, error);
      }
    }

    console.log('\n🎉 Processo concluído!\n');

  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixPageImages();
