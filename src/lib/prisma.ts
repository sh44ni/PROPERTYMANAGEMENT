import { PrismaClient } from '@prisma/client';

// Prevent multiple PrismaClient instances during HMR in development.
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// Opt-in SQL logging via PRISMA_LOG=query (default: errors + warnings only).
// Full query logging on every request adds significant overhead, so we default off.
const logLevels: ('query' | 'error' | 'warn')[] =
    process.env.PRISMA_LOG === 'query'
        ? ['query', 'error', 'warn']
        : process.env.NODE_ENV === 'development'
            ? ['error', 'warn']
            : ['error'];

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: logLevels,
    });

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

export default prisma;
