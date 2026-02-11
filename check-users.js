const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const roles = await prisma.user.groupBy({
    by: ['role'],
    _count: {
      _all: true
    }
  });
  console.log('Roles distribution:', JSON.stringify(roles, null, 2));

  const sampleUsers = await prisma.user.findMany({
    take: 5,
    select: {
      id: true,
      email: true,
      role: true,
      name: true
    }
  });
  console.log('Sample users:', JSON.stringify(sampleUsers, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
