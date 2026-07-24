import { PrismaService } from '../prisma/prisma.service';
import { SeedService } from './seed.service';

async function run(): Promise<void> {
  const prisma = new PrismaService();
  await prisma.onModuleInit();
  const seed = new SeedService(prisma);
  await seed.seedIfNeeded();
  await prisma.$disconnect();
}

run();
