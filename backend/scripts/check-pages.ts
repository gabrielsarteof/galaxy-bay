import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPages() {
  console.log('\n📊 Verificando páginas no banco...\n');

  const pages = await prisma.page.findMany({
    orderBy: [
      { salesCount: 'desc' },
      { viewCount: 'desc' },
    ],
    take: 10,
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      salesCount: true,
      viewCount: true,
      category: true,
    },
  });

  console.log('Top 10 páginas por vendas:\n');
  pages.forEach((page, index) => {
    console.log(`${index + 1}. ${page.name}`);
    console.log(`   Slug: ${page.slug}`);
    console.log(`   Status: ${page.status}`);
    console.log(`   Vendas: ${page.salesCount} | Views: ${page.viewCount}`);
    console.log(`   Categoria: ${page.category}\n`);
  });

  const totalPages = await prisma.page.count();
  const publishedPages = await prisma.page.count({ where: { status: 'published' } });

  console.log(`\n📈 Resumo:`);
  console.log(`   Total de páginas: ${totalPages}`);
  console.log(`   Páginas publicadas: ${publishedPages}\n`);

  await prisma.$disconnect();
}

checkPages().catch(console.error);
