import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
    return new PrismaClient({
        log: ['query'],
    })
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined
}

const basePrisma = globalForPrisma.prisma ?? prismaClientSingleton()

export const prisma = basePrisma.$extends({
    query: {
        $allModels: {
            async $allOperations({ model, operation, args, query }: { model: string, operation: string, args: any, query: (args: any) => Promise<any> }): Promise<any> {
                const softDeleteModels = ['Manga', 'Chapter'];

                if (softDeleteModels.includes(model)) {
                    // Filter out deleted records for find/count operations
                    if (['findMany', 'findFirst', 'findUnique', 'count', 'aggregate', 'groupBy'].includes(operation)) {
                        args.where = { ...args.where, deletedAt: null };
                    }

                    // Convert delete to update
                    if (operation === 'delete') {
                        return (basePrisma as any)[model].update({
                            where: args.where,
                            data: { deletedAt: new Date() },
                        });
                    }

                    // Convert deleteMany to updateMany
                    if (operation === 'deleteMany') {
                        return (basePrisma as any)[model].updateMany({
                            where: args.where,
                            data: { deletedAt: new Date() },
                        });
                    }
                }
                return query(args);
            },
        },
    },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = basePrisma
