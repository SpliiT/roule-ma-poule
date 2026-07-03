import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Clearing all interventions...');
  const result = await prisma.intervention.deleteMany({});
  console.log(`Successfully deleted ${result.count} interventions.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
