import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { PageService } from './src/pages/page.service';

async function testCreatePage() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const pageService = app.get(PageService);

  try {
    console.log('🧪 Testando criação de página...\n');

    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const user = await prisma.user.findFirst();
    
    if (!user) {
      console.log('❌ Nenhum usuário encontrado no banco');
      await prisma.$disconnect();
      return;
    }

    console.log('✅ Usuário encontrado:', user.walletAddress);

    const timestamp = Date.now();
    const testPageData = {
      name: 'Página Teste Geração',
      slug: `test-gen-${timestamp}`,
      tagline: 'Testando geração automática de imagens',
      status: 'draft' as const,
    };

    console.log('📝 Criando página:', testPageData.slug);
    const page = await pageService.create(user.id, testPageData);
    console.log('✅ Página criada com ID:', page.id);

    console.log('\n⏳ Aguardando 5 segundos para geração de imagens...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    const fs = require('fs');
    const path = require('path');
    
    const avatarPath = path.join(process.cwd(), '..', 'storage', 'avatars', page.id, 'avatar.png');
    const bannerPath = path.join(process.cwd(), '..', 'storage', 'banners', page.id, 'banner.png');

    console.log('\n📁 Verificando arquivos gerados:');
    console.log('Avatar:', avatarPath);
    console.log('  Existe?', fs.existsSync(avatarPath) ? '✅ SIM' : '❌ NÃO');
    
    console.log('Banner:', bannerPath);
    console.log('  Existe?', fs.existsSync(bannerPath) ? '✅ SIM' : '❌ NÃO');

    const updatedPage = await prisma.page.findUnique({ where: { id: page.id } });
    console.log('\n📊 URLs no banco:');
    console.log('  avatarUrl:', updatedPage.avatarUrl || 'null');
    console.log('  bannerUrl:', updatedPage.bannerUrl || 'null');

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Erro ao testar:', error);
  }

  await app.close();
}

testCreatePage();
