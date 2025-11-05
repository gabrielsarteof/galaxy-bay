import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listPages() {
  try {
    const pages = await prisma.page.findMany({
      include: {
        owner: true,
        collections: true,
        nfts: true,
      }
    });

    console.log('📄 Páginas no banco de dados:\n');

    if (pages.length === 0) {
      console.log('  ❌ Nenhuma página encontrada!\n');
      console.log('  Isso provavelmente aconteceu porque o banco foi resetado com "prisma db push".');
      console.log('  Solução: Crie uma nova página no frontend.\n');
    } else {
      pages.forEach(page => {
        console.log(`  Nome: ${page.name}`);
        console.log(`  Slug: ${page.slug}`);
        console.log(`  Owner ID: ${page.ownerId}`);
        console.log(`  Owner Address: ${page.owner.address}`);
        console.log(`  Status: ${page.status}`);
        console.log(`  Collections: ${page.collections.length}`);
        console.log(`  NFTs: ${page.nfts.length}`);
        console.log(`  Created: ${page.createdAt}`);
        console.log('  ---');
      });

      console.log(`\nTotal: ${pages.length} página(s)`);
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listPages();
