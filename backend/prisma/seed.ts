import { PrismaClient, PageStatus, Page } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { ImageGeneratorService } from '../src/infrastructure/storage/image-generator.service';
import { LocalStorageService } from '../src/infrastructure/storage/local-storage.service';

const prisma = new PrismaClient();
const imageGenerator = new ImageGeneratorService();
const storage = new LocalStorageService();

const CATEGORIES = [
  'Arte',
  'Colecionáveis',
  'Música',
  'Fotografia',
  'Esportes',
  'Trading Cards',
];

const TAGS_POOL = [
  'digital-art',
  'abstract',
  'photography',
  'music',
  'collectibles',
  '3d-art',
  'pixel-art',
  'generative',
  'sports',
  'gaming',
];

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  const users = await Promise.all(
    Array.from({ length: 10 }).map(async (_, i) => {
      const address = `0x${faker.string.hexadecimal({ length: 40, casing: 'lower', prefix: '' })}`;

      return prisma.user.upsert({
        where: { address },
        update: {},
        create: {
          address,
          username: faker.internet.username().toLowerCase(),
          avatarUrl: null,
        },
      });
    })
  );

  console.log(`✅ Criados ${users.length} usuários`);

  console.log('\n🎨 Criando páginas e gerando imagens...\n');

  const pages: Page[] = [];
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const name = faker.company.name();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + `-${i}`;
    const category = CATEGORIES[i % CATEGORIES.length];
    const tags = faker.helpers.arrayElements(TAGS_POOL, faker.number.int({ min: 2, max: 5 }));

    const page = await prisma.page.create({
      data: {
        name,
        slug,
        ownerId: user.id,
        tagline: faker.company.catchPhrase(),
        description: faker.lorem.paragraphs(2),
        status: PageStatus.published,
        category,
        tags,
        viewCount: faker.number.int({ min: 100, max: 10000 }),
        salesCount: faker.number.int({ min: 5, max: 500 }),
        twitterUrl: faker.helpers.maybe(() => `https://twitter.com/${faker.internet.username()}`, { probability: 0.7 }),
        instagramUrl: faker.helpers.maybe(() => `https://instagram.com/${faker.internet.username()}`, { probability: 0.6 }),
        websiteUrl: faker.helpers.maybe(() => faker.internet.url(), { probability: 0.5 }),
        benefitsText: faker.lorem.paragraph(),
      },
    });

    console.log(`  📄 ${name}`);
    console.log(`     🎨 Gerando avatar...`);

    try {
      const avatarUrl = imageGenerator.getDefaultAvatarUrl(page.name);
      const avatarResponse = await fetch(avatarUrl);
      const avatarSvgBuffer = Buffer.from(await avatarResponse.arrayBuffer());
      const avatarPngBuffer = await imageGenerator.convertAvatarToPng(avatarSvgBuffer);
      const avatarPath = `avatars/${page.id}/avatar.png`;
      await storage.upload(avatarPath, avatarPngBuffer, 'image/png');

      console.log(`     🖼️  Gerando banner...`);
      const bannerSvgBuffer = imageGenerator.generateDefaultBanner(page.name);
      const bannerPngBuffer = await imageGenerator.convertBannerToPng(bannerSvgBuffer);
      const bannerPath = `banners/${page.id}/banner.png`;
      await storage.upload(bannerPath, bannerPngBuffer, 'image/png');

      console.log(`     ✅ Imagens criadas com sucesso!\n`);
    } catch (error) {
      console.error(`     ❌ Erro ao gerar imagens:`, error);
    }

    pages.push(page);
  }

  console.log(`✅ Criadas ${pages.length} páginas publicadas com imagens`);

  for (const page of pages) {
    const numCollections = faker.number.int({ min: 1, max: 3 });

    for (let i = 0; i < numCollections; i++) {
      const collectionName = faker.commerce.productName();
      const collectionSlug = collectionName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      const collection = await prisma.collection.create({
        data: {
          pageId: page.id,
          name: collectionName,
          slug: collectionSlug,
          description: faker.commerce.productDescription(),
        },
      });

      const numNfts = faker.number.int({ min: 3, max: 8 });

      for (let j = 0; j < numNfts; j++) {
        const tokenId = `${page.id.slice(0, 8)}-${collection.id.slice(0, 8)}-${j}`;
        const isListed = faker.helpers.maybe(() => true, { probability: 0.6 });

        await prisma.nft.create({
          data: {
            tokenId,
            name: faker.commerce.productName(),
            description: faker.commerce.productDescription(),
            imageUrl: faker.image.url(),
            metadataUrl: `ipfs://${faker.string.hexadecimal({ length: 46, prefix: '' })}`,
            price: isListed ? faker.number.float({ min: 0.01, max: 5, fractionDigits: 4 }) : null,
            status: isListed ? 'listed' : 'minted',
            ownerId: page.ownerId,
            pageId: page.id,
            collectionId: collection.id,
            mintedAt: faker.date.past(),
            listedAt: isListed ? faker.date.recent() : null,
          },
        });
      }
    }
  }

  console.log('✅ Criadas coleções e NFTs para todas as páginas');

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log(`📊 Resumo:`);
  console.log(`   - ${users.length} usuários`);
  console.log(`   - ${pages.length} páginas`);
  console.log(`   - Múltiplas coleções e NFTs por página\n`);
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
