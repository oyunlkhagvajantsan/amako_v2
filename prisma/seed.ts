import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting database seed...');

    // Seed genres
    console.log('Seeding genres...');

    const genres = [
        { name: 'Action', nameMn: 'Тулаант', slug: 'action' },
        { name: 'Romance', nameMn: 'Хайр дурлал', slug: 'romance' },
        { name: 'Comedy', nameMn: 'Инээдэм', slug: 'comedy' },
        { name: 'Drama', nameMn: 'Драм', slug: 'drama' },
        { name: 'Fantasy', nameMn: 'Уран зөгнөл', slug: 'fantasy' },
        { name: 'Horror', nameMn: 'Аймшгийн', slug: 'horror' },
        { name: 'Mystery', nameMn: 'Нууцлаг', slug: 'mystery' },
        { name: 'Slice of Life', nameMn: 'Бодит амьдралтай ойр', slug: 'slice-of-life' },
        { name: 'Supernatural', nameMn: 'Ер бусын', slug: 'supernatural' },
        { name: 'Sci-Fi', nameMn: 'Шинжлэх ухаан', slug: 'sci-fi' },
        { name: 'Adventure', nameMn: 'Адал явдалт', slug: 'adventure' },
        { name: 'Psychological', nameMn: 'Сэтгэл зүйн', slug: 'psychological' },
        { name: 'School', nameMn: 'Сургууль', slug: 'school' },
        { name: 'Sports', nameMn: 'Спорт', slug: 'sports' },
        { name: 'Historical', nameMn: 'Түүхэн', slug: 'historical' },
        { name: 'Martial Arts', nameMn: 'Тулааны урлаг', slug: 'martial-arts' },
        { name: 'Tragedy', nameMn: 'Эмгэнэлт', slug: 'tragedy' },
        { name: 'Crime', nameMn: 'Гэмт хэрэг', slug: 'crime' },
    ];

    for (const genre of genres) {
        await prisma.genre.upsert({
            where: { slug: genre.slug },
            update: {},
            create: genre,
        });
    }
    console.log(`✅ Seeded ${genres.length} genres successfully!`);

    // Create admin user
    console.log('Creating admin user...');
    const hashedPassword = await bcrypt.hash('Amako2026$', 10);

    await prisma.user.upsert({
        where: { email: 'ama.yuri002@gmail.com' },
        update: {
            role: 'ADMIN',
        },
        create: {
            email: 'ama.yuri002@gmail.com',
            username: 'ama_admin',
            password: hashedPassword,
            role: 'ADMIN',
        },
    });
    console.log('✅ Admin user created successfully!');

    // Create moderator user
    console.log('Creating moderator user...');
    const modPassword = await bcrypt.hash('moderator123', 10);

    await prisma.user.upsert({
        where: { email: 'moderator@example.com' },
        update: {
            role: 'MODERATOR',
        },
        create: {
            email: 'moderator@example.com',
            username: 'ama_mod',
            password: modPassword,
            role: 'MODERATOR',
        },
    });
    console.log('✅ Moderator user created successfully!');

    console.log('\n🎉 Database seeding completed!');
}

main()
    .catch((e) => {
        console.error('Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
