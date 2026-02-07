import { PrismaClient } from '@prisma/client'

const basePrisma = new PrismaClient({
    log: ['query'],
})

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

if (process.env.NODE_ENV !== 'production') (global as any).prisma = prisma;
