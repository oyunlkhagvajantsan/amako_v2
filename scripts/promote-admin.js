const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const email = process.argv[2];

    if (!email) {
        console.error('Please provide an email address: npm run promote-admin <email>');
        process.exit(1);
    }

    try {
        const user = await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' },
        });
        console.log(`✅ Successfully promoted ${user.email} to ADMIN!`);
    } catch (error) {
        console.error('Error promoting user:', error);
        console.error('Make sure the user exists first!');
    } finally {
        await prisma.$disconnect();
    }
}

main();
