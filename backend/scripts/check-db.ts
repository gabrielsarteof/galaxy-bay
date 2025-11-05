/**
 * Script para verificar estado do banco de dados
 * Verifica se as tabelas existem e mostra contagem de registros
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Verificando banco de dados...\n');

    // Verifica Users
    const userCount = await prisma.user.count();
    console.log(`✓ Users: ${userCount} registros`);

    // Verifica Pages
    const pageCount = await prisma.page.count();
    console.log(`✓ Pages: ${pageCount} registros`);

    // Verifica Collections
    const collectionCount = await prisma.collection.count();
    console.log(`✓ Collections: ${collectionCount} registros`);

    // Verifica NFTs
    const nftCount = await prisma.nft.count();
    console.log(`✓ NFTs: ${nftCount} registros`);

    // Verifica Activities
    const activityCount = await prisma.activity.count();
    console.log(`✓ Activities: ${activityCount} registros`);

    console.log('\n✅ Banco de dados verificado com sucesso!');

    if (userCount === 0) {
      console.log('\n⚠️  ATENÇÃO: Nenhum usuário encontrado!');
      console.log('   Para criar uma página, faça login primeiro no frontend.');
      console.log('   O sistema criará seu usuário automaticamente.');
    }

  } catch (error) {
    console.error('❌ Erro ao verificar banco de dados:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
