import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'arlert409@gmail.com';
    console.log(`Checking user: ${email}`);

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                isSubscribed: true,
                subscriptionEnd: true,
                paymentRequests: {
                    orderBy: { createdAt: 'desc' },
                    take: 2,
                },
                notifications: {
                    orderBy: { createdAt: 'desc' },
                    take: 2,
                }
            }
        });

        if (!user) {
            console.log("User not found in database.");
        } else {
            console.log("User found:", JSON.stringify(user, null, 2));
        }

        const auditLogs = await prisma.auditLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        console.log("Recent Audit Logs:", JSON.stringify(auditLogs, null, 2));

    } catch (e) {
        console.error("Error checking DB:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
