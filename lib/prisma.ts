import { PrismaClient } from '@prisma/client'

// In Next.js, we use a global variable to prevent multiple PrismaClient instances
// from being created during HMR (hot module replacement) in development.
// This prevents "Timed out fetching a new connection from the connection pool" errors.

const prismaClientSingleton = () => {
    const baseClient = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })

    return baseClient.$extends({
        query: {
            $allModels: {
                async $allOperations({ model, operation, args, query }): Promise<any> {
                    const softDeleteModels = ['Manga', 'Chapter'];

                    if (softDeleteModels.includes(model)) {
                        // Filter out deleted records for find/count operations
                        if (['findMany', 'findFirst', 'findUnique', 'count', 'aggregate', 'groupBy'].includes(operation)) {
                            (args as any).where = { ...(args as any).where, deletedAt: null };
                        }

                        // Convert delete to update
                        if (operation === 'delete') {
                            return (baseClient as any)[model].update({
                                where: (args as any).where,
                                data: { deletedAt: new Date() },
                            });
                        }

                        // Convert deleteMany to updateMany
                        if (operation === 'deleteMany') {
                            return (baseClient as any)[model].updateMany({
                                where: (args as any).where,
                                data: { deletedAt: new Date() },
                            });
                        }
                    }
                    return query(args);
                },
            },
        },
    });
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
