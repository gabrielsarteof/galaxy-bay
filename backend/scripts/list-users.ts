import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listUsers() {
  try {
    const users = await prisma.user.findMany();

    console.log('👥 Usuários no banco de dados:\n');

    users.forEach(user => {
      console.log(`  ID: ${user.id}`);
      console.log(`  Address: ${user.address}`);
      console.log(`  Username: ${user.username || '(não definido)'}`);
      console.log(`  Created: ${user.createdAt}`);
      console.log('  ---');
    });

    console.log(`\nTotal: ${users.length} usuário(s)`);

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
