// Script para gerar imagens padrão para página existente
const { PrismaClient } = require('@prisma/client');
const fs = require('fs/promises');
const path = require('path');

const prisma = new PrismaClient();

// Funções de geração de imagens (mesmo do backend)
function getColor(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  const h = Math.abs(hash % 360);
  const s = 60 + (Math.abs(hash >> 8) % 30);
  const l = 70 + (Math.abs(hash >> 16) % 15);

  return hslToHex(h, s, l);
}

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) { r = c; g = x; b = 0; }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
  else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
  else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
  else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
  else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

  const toHex = (n) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function getDefaultAvatarUrl(seed) {
  const bg = getColor(seed).replace('#', '');
  const seedEnc = encodeURIComponent(seed);
  return `https://api.dicebear.com/9.x/initials/svg?seed=${seedEnc}&backgroundColor=${bg}&size=128`;
}

function generateDefaultBanner(seed) {
  const c1 = getColor(seed);
  const c2 = getColor(seed + '_alt');

  const svg = `<svg width="2560" height="1440" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${c1};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${c2};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="2560" height="1440" fill="url(#grad)" />
</svg>`;

  return Buffer.from(svg, 'utf-8');
}

async function main() {
  console.log('🔧 Gerando imagens padrão para páginas existentes...\n');

  // Busca todas as páginas sem imagens
  const pages = await prisma.page.findMany({
    where: {
      OR: [
        { avatarUrl: null },
        { bannerUrl: null },
      ],
    },
  });

  if (pages.length === 0) {
    console.log('✅ Todas as páginas já têm imagens!');
    return;
  }

  console.log(`📄 Encontradas ${pages.length} página(s) sem imagens\n`);

  for (const page of pages) {
    console.log(`\n📦 Processando: ${page.name} (${page.id})`);

    try {
      const version = Date.now();
      const updateData = {};

      // Gera avatar se necessário
      if (!page.avatarUrl) {
        console.log('  🎨 Gerando avatar...');
        const avatarUrl = getDefaultAvatarUrl(page.name);
        const response = await fetch(avatarUrl);
        const avatarBuffer = Buffer.from(await response.arrayBuffer());

        const avatarDir = path.join(__dirname, '..', 'storage', 'avatars', page.id);
        await fs.mkdir(avatarDir, { recursive: true });

        const avatarPath = path.join(avatarDir, 'avatar.svg');
        await fs.writeFile(avatarPath, avatarBuffer);

        updateData.avatarUrl = `http://localhost:3000/uploads/avatars/${page.id}/avatar.svg?v=${version}`;
        console.log('  ✅ Avatar salvo!');
      }

      // Gera banner se necessário
      if (!page.bannerUrl) {
        console.log('  🎨 Gerando banner...');
        const bannerBuffer = generateDefaultBanner(page.name);

        const bannerDir = path.join(__dirname, '..', 'storage', 'banners', page.id);
        await fs.mkdir(bannerDir, { recursive: true });

        const bannerPath = path.join(bannerDir, 'banner.svg');
        await fs.writeFile(bannerPath, bannerBuffer);

        updateData.bannerUrl = `http://localhost:3000/uploads/banners/${page.id}/banner.svg?v=${version}`;
        console.log('  ✅ Banner salvo!');
      }

      // Atualiza banco
      await prisma.page.update({
        where: { id: page.id },
        data: updateData,
      });

      console.log(`  💾 URLs salvas no banco!`);
    } catch (error) {
      console.error(`  ❌ Erro ao processar ${page.name}:`, error.message);
    }
  }

  console.log('\n✅ Migração concluída!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
