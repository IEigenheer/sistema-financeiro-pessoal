"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_service_1 = require("../prisma/prisma.service");
const seed_service_1 = require("./seed.service");
async function run() {
    const prisma = new prisma_service_1.PrismaService();
    await prisma.onModuleInit();
    const seed = new seed_service_1.SeedService(prisma);
    await seed.seedIfNeeded();
    await prisma.$disconnect();
}
run();
