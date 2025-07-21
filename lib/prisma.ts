// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var globalForPrisma: { prisma?: PrismaClient };
}

const globalLib = global as typeof global & {
  globalForPrisma: { prisma?: PrismaClient };
};

globalLib.globalForPrisma = globalLib.globalForPrisma || {};

const prisma =
  globalLib.globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalLib.globalForPrisma.prisma = prisma;
}

export default prisma;
