
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const mangaData = [
    {
        id: 6,
        title: "The Guy She Was Interested in Wasn't a Guy at All",
        titleMn: "Сонирхдог залуу маань эрэгтэй биш байсан",
        description: "Загварлаг, цовоо сэргэлэн ахлах ангийн сурагч Аяа ойролцоох CD дэлгүүрийн ажилтныг шохоорхож эхэлдэг. Нууцлаг, сайхан хувцасладаг, хөгжмийн мэдрэмжтэй залуу. Гэвч Аяа нэг зүйлийг мэдэхгүй… тэр залуу нь эрэгтэй биш гэдгийг.",
        author: "Agu",
        artist: "Agu",
        status: "ONGOING",
        type: "MANGA",
        publishYear: 2022,
        isAdult: false,
        isOneshot: false,
        genres: ["Инээдэм", "Сургууль", "Хайр дурлал", "Бодит амьдралтай ойр"]
    },
    {
        id: 11,
        title: "Sadistic Beauty: Side Story A",
        titleMn: "Садист гоо үзэсгэлэн",
        description: "",
        author: "Woo Yunhee",
        artist: "Lee Geumsan",
        status: "COMPLETED",
        type: "MANHWA",
        publishYear: 2021,
        isAdult: true,
        isOneshot: false,
        genres: ["Инээдэм", "Хайр дурлал", "Драм"]
    },
    {
        id: 16,
        title: "My Princess Charming",
        titleMn: "Миний дур булаам гүнж",
        description: "Залуусын анхаарлаас залхсан Юүна өөртөө хуурамч найз залуу олохоор шийддэг. Нэг өдөр харахад яг л төгс найз залуу мэт сэтгэл татам нэгнийг оллоо. Гэтэл таарсан царайлаг “залуу” нь үнэндээ эмэгтэй болж таарна. Юүна маань яах бол?",
        author: "Teunteun",
        artist: "Teunteun",
        status: "COMPLETED",
        type: "MANHWA",
        publishYear: 2020,
        isAdult: false,
        isOneshot: false,
        genres: ["Инээдэм", "Сургууль", "Хайр дурлал", "Бодит амьдралтай ойр", "Драм"]
    },
    {
        id: 18,
        title: "I Adore You, Teacher",
        titleMn: "Багш аа, би танд сайн",
        description: "Сонмин жирийн нэгэн оюутан мэт харагддаг ч хөшигний ард багшийнхаа хүсэл тачаалын зугаа болж амьдардаг. Гэтэл түүний давтлага өгдөг Юүжин энэ нууцыг нь мэдсэнээр бүх зүйл орвонгоороо эргэнэ.",
        author: "RANGRARI",
        artist: "RANGRARI",
        status: "COMPLETED",
        type: "MANHWA",
        publishYear: 2024,
        isAdult: true,
        isOneshot: false,
        genres: ["Хайр дурлал", "Драм"]
    },
    {
        id: 19,
        title: "Finding Assistant Manager Kim",
        titleMn: "Ким туслахыг олоорой",
        description: "",
        author: "RANGRARI",
        artist: "RANGRARI",
        status: "COMPLETED",
        type: "MANHWA",
        publishYear: 2023,
        isAdult: true,
        isOneshot: true,
        genres: ["Хайр дурлал", "Бодит амьдралтай ойр"]
    },
    {
        id: 26,
        title: "Model Advisory",
        titleMn: "Загварын зөвлөгөө",
        description: "Цэцэгс дэлгэрсэн нэгэн хаврын өдөр ахлах сургуулийн нэгдүгээр ангийн сурагч Боми өөрийн төсөөллийн хүнээ зуртал тэр нь шалгалтын дүнгээр дээгүүрт бичигддэг царайлаг, спортлог дээд ангийн сурагч Хэюүнтэй яг ижилхэн харагддагийг олж мэднэ.",
        author: "Pony",
        artist: "Ahn Eunjin",
        status: "COMPLETED",
        type: "MANHWA",
        publishYear: 2021,
        isAdult: false,
        isOneshot: false,
        genres: ["Инээдэм", "Сургууль", "Хайр дурлал", "Бодит амьдралтай ойр", "Драм"]
    },
    {
        title: "Bad Thinking Diary",
        titleMn: "Завхай бодлын өдрийн тэмдэглэл",
        description: "17 настайгаасаа 21 нас хүртлээ салшгүй дотно найзууд байсан Минжи, Юүна хоёрын харилцаа Минжигийн хачин зүүднээс болж өөрчлөгдөж эхэлнэ. Хайр, догдлол, эзэмдэх хүсэл. Энэ 'завхай бодлууд' тэднийг хааш нь хөтлөх бол?",
        author: "Hodan",
        artist: "RANGRARI",
        status: "ONGOING",
        type: "MANHWA",
        publishYear: 2022,
        isAdult: true,
        isOneshot: false,
        genres: ["Хайр дурлал", "Драм"]
    },
    {
        title: "Relationship Guidelines",
        titleMn: "Харилцааны удиртамж",
        description: "'Тэр үнсэлтээс л бүх юм боллоо! Тэгдэггүй л байж!' Багын найздаа үнсүүлсэн Живон юу мэдэрч байгаагаа ойлгох хэрэгтэй болно. Хоёр найзын харилцаа хааш эргэхийг хараарай.",
        author: "EPUM",
        artist: "EPUM",
        status: "ONGOING",
        type: "MANHWA",
        publishYear: 2020,
        isAdult: false,
        isOneshot: false,
        genres: ["Сургууль", "Хайр дурлал", "Бодит амьдралтай ойр"]
    },
    {
        title: "Opium",
        titleMn: "Мансууруулах бодис",
        description: "1946 он, Чусон. Үзэсгэлэнтэй, ухаалаг Мариа Арден эмч өөрийн төрсөн нутагтаа АНУ-ын армийн эмнэлгийн зөвлөхөөр ирнэ. Тэнд тэр нийгмээс гадуурхагдсан, нууцлаг эмэгтэй И Кёнжүтэй учирдаг. Эхэндээ гүехэн сээтэгнэл мэт байсан харилцаа удалгүй хориотой хайр дурлал болон хувирна...",
        author: "Aji",
        artist: "Junghyun",
        status: "ONGOING",
        type: "MANHWA",
        publishYear: 2020,
        isAdult: true,
        isOneshot: false,
        genres: ["Түүхэн", "Гэмт хэрэг"]
    },
    {
        title: "Living Will",
        titleMn: "Амьдрах хүсэл",
        description: "Биеэ үнэлэгчийн газар ажилдаг Жэанне гэх эмэгтэй шархадсан байсан Жаннет-ийг олж авран тэдний зам огтлолцож, тэдний дотоод шарх, өнгөрсөн ба одоо үеийн сэтгэлийн тэмцэл хайрын хэлбэрээр илэрнэ. Нууцлаг, сэтгэл хөдөлгөм энэ түүхийг та манайхаас хүлээн авч уншаарай.",
        author: "Mina",
        artist: "ZIHO",
        status: "COMPLETED",
        type: "MANHWA",
        publishYear: 2019,
        isAdult: false,
        isOneshot: false,
        genres: ["Драм", "Эмгэнэлт", "Сэтгэл зүйн"]
    },
    {
        title: "The Name Of My Feelings",
        titleMn: "Миний сэтгэлийн нэр",
        description: "Нэгэн бороотой өдөр Сиёон хойд эгчдээ сэтгэлтэй гэдгээ ухаарна. Үүнээс болоод бороотой өдөр болгон түүнийг зовоож эхэлнэ.",
        author: "Kang Unnie",
        artist: "Misspm",
        status: "COMPLETED",
        type: "MANHWA",
        publishYear: 2024,
        isAdult: true,
        isOneshot: true,
        genres: ["Хайр дурлал"]
    },
    {
        title: "What Does the Fox Say?",
        titleMn: "Үнэг юу гэж хэлдэг вэ?",
        description: "",
        author: "Team Gaji",
        artist: "Team Gaji",
        status: "ONGOING",
        type: "MANHWA",
        publishYear: 2015,
        isAdult: true,
        isOneshot: false,
        genres: ["Хайр дурлал", "Драм"]
    },
    {
        title: "Show Me Your Bust",
        titleMn: "Надад хөхөө харуулаач",
        description: "",
        author: "Team Gaji",
        artist: "Team Gaji",
        status: "ONGOING",
        type: "MANHWA",
        publishYear: 2023,
        isAdult: true,
        isOneshot: false,
        genres: ["Хайр дурлал", "Драм", "Сургууль"]
    },
    {
        title: "Secret Garden",
        titleMn: "Нууц цэцэрлэг",
        description: "Цуурхалд дарагдсан охин Шино, төгс сурагч Юүи хоёр дотуур байранд хамт амьдарч, тус бүрийн зүрхний шарх, ганцаардлыг даван туулах аялалдаа хамтдаа хөл тавина. Нууцлаг, намуухан хайрын түүхийг манайхаас хүлээн авч уншаарай.",
        author: "Yumemitsuki",
        artist: "Yumemitsuki",
        status: "ONGOING",
        type: "MANGA",
        publishYear: 2020,
        isAdult: false,
        isOneshot: false,
        genres: ["Драм", "Сургууль", "Хайр дурлал", "Бодит амьдралтай ойр"]
    },
    {
        title: "Eat U Up",
        titleMn: "Чамайг иднэ",
        description: "",
        author: "프레사파이",
        artist: "프레사파и", // Typo in image but let's use Korean if possible
        status: "COMPLETED",
        type: "MANHWA",
        publishYear: 2023,
        isAdult: true,
        isOneshot: false,
        genres: ["Хайр дурлал", "Драм"]
    },
    {
        title: "Her Tale of Shim Chong",
        titleMn: "Түүний Шим Чон",
        description: "Өлсгөлөн, ядуурал дунд сохор эцгийнхээ ганц найдвар болсон гуйлгачин охин Шим Чон. Эцгийнхээ харааг сэргээхийн төлөө тэр боломжгүй мэт золиосыг хийхээр шийднэ. Гэвч энэ бол зөвхөн эхлэл… Итгэл, зовлон, нууцлаг хувь тавилангаар чиглэсэн уянгын түүхийг та манайхаас уншаарай.",
        author: "Seri",
        artist: "Biwan",
        status: "ONGOING",
        type: "MANHWA",
        publishYear: 2017,
        isAdult: false,
        isOneshot: false,
        genres: ["Хайр дурлал", "Драм", "Түүхэн"]
    },
    {
        title: "The Devil Knows Your Name",
        titleMn: "Нэрийг чинь мэддэг чөтгөр",
        description: "Хүн төрөлхтнийг донтоож, айдаст автуулдаг чөтгөрүүд оршин байдаг энэ ертөнцөд, ийм аюулт нөхцөл байдалд Сүм чөтгөрүүдийн эсрэг тэмцэх цэргүүдийг байгуулан, хүн ба чөтгөрийн хооронд ширүүн тулаан өрнөнө. Гэвч тэр дундаас нэгэн чөтгөр гэлэнмаатай хайр дурлалыг мөрөөдөж буй нь нууц хэвээр...",
        author: "Lasagne and Cheese",
        artist: "Lasagne and Cheese",
        status: "ONGOING",
        type: "MANHWA",
        publishYear: 2020,
        isAdult: false,
        isOneshot: false,
        genres: ["Хайр дурлал", "Уран зөгнөл"]
    },
    {
        title: "Spiteful Affection",
        titleMn: "Сайн найзууд",
        description: "",
        author: "Habinu",
        artist: "Salk",
        status: "ONGOING",
        type: "MANHWA",
        publishYear: 2020,
        isAdult: true,
        isOneshot: false,
        genres: ["Хайр дурлал", "Драм"]
    },
    {
        title: "Drunken My Boss",
        titleMn: "Миний архичин босс",
        description: "",
        author: "BBTan",
        artist: "BBTan",
        status: "ONGOING",
        type: "MANHWA",
        publishYear: 2024,
        isAdult: true,
        isOneshot: false,
        genres: []
    },
    {
        title: "A Pet's Aesthetic",
        titleMn: "Тэжээрвэр амьтны гоо сайхан",
        description: "",
        author: "Team Gaji",
        artist: "Team Gaji",
        status: "COMPLETED",
        type: "MANHWA",
        publishYear: 2018,
        isAdult: true,
        isOneshot: false,
        genres: []
    },
    {
        title: "Getting To Know Grace",
        titleMn: "Грейсийг мэдэж эхэлсэн нь",
        description: "",
        author: "Seo Rim",
        artist: "Mokma",
        status: "ONGOING",
        type: "MANHWA",
        publishYear: 2019,
        isAdult: false,
        isOneshot: false,
        genres: ["Драм", "Сэтгэл зүйн", "Түүхэн"]
    }
];

async function main() {
    console.log('Starting manga metadata update...');

    // Reset sequence to max ID to avoid conflicts with manual IDs
    try {
        await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"Manga"', 'id'), (SELECT MAX(id) FROM "Manga"));`);
        console.log('✅ Manga ID sequence reset to max available ID.');
    } catch (e) {
        console.warn('⚠️ Could not reset sequence (may not be PostgreSQL or sequence name mismatch):', e);
    }

    // Fetch all genres for mapping
    const allGenres = await prisma.genre.findMany();
    const genreMap = new Map();
    allGenres.forEach(g => {
        genreMap.set(g.nameMn, g.id);
    });

    for (const data of mangaData) {
        const { genres, id, ...rest } = data;
        const genreIds = genres.map(name => genreMap.get(name)).filter(id => id !== undefined);

        let targetId = id;
        if (!targetId) {
            const existingByName = await prisma.manga.findFirst({
                where: { OR: [{ title: data.title }, { titleMn: data.titleMn }] }
            });
            if (existingByName) {
                targetId = existingByName.id;
                console.log(`Found existing manga by title: ${data.title} (ID: ${targetId})`);
            }
        }

        if (targetId) {
            console.log(`Updating manga ID ${targetId}: ${data.title}`);
            await prisma.manga.update({
                where: { id: targetId },
                data: {
                    ...(rest as any),
                    genres: {
                        set: genreIds.map(gid => ({ id: gid }))
                    }
                }
            });
        } else {
            console.log(`Creating new manga: ${data.title}`);
            await prisma.manga.create({
                data: {
                    ...(rest as any),
                    coverImage: 'placeholder.jpg',
                    genres: {
                        connect: genreIds.map(gid => ({ id: gid }))
                    }
                }
            });
        }
    }

    console.log('🎉 Manga metadata sync completed!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
