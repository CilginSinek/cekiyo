import { PrismaClient } from '../prisma/generated/client';

interface CustomGlobal {
  prisma?: PrismaClient;
}

const globalForPrisma = globalThis as CustomGlobal;

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
