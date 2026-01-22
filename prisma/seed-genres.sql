-- Genre Seed Script
-- Run this in Prisma Studio or using psql

-- Common Genres with English and Mongolian names

INSERT INTO "Genre" (id, name, "nameMn", slug, "createdAt") VALUES 
('genre_action', 'Action', 'Тулаант', 'action', NOW()),
('genre_romance', 'Romance', 'Хайр дурлал', 'romance', NOW()),
('genre_comedy', 'Comedy', 'Инээдэм', 'comedy', NOW()),
('genre_drama', 'Drama', 'Драм', 'drama', NOW()),
('genre_fantasy', 'Fantasy', 'Уран зөгнөл', 'fantasy', NOW()),
('genre_horror', 'Horror', 'Аймшгийн', 'horror', NOW()),
('genre_mystery', 'Mystery', 'Нууцлаг', 'mystery', NOW()),
('genre_slice_of_life', 'Slice of Life', 'Бодит амьдралтай ойр', 'slice-of-life', NOW()),
('genre_supernatural', 'Supernatural', 'Ер бусын', 'supernatural', NOW()),
('genre_sci_fi', 'Sci-Fi', 'Шинжлэх ухаан', 'sci-fi', NOW()),
('genre_adventure', 'Adventure', 'Адал явдалт', 'adventure', NOW()),
('genre_psychological', 'Psychological', 'Сэтгэл зүйн', 'psychological', NOW()),
('genre_school', 'School', 'Сургууль', 'school', NOW()),
('genre_sports', 'Sports', 'Спорт', 'sports', NOW()),
('genre_historical', 'Historical', 'Түүхэн', 'historical', NOW()),
('genre_martial_arts', 'Martial Arts', 'Тулааны урлаг', 'martial-arts', NOW());

-- To run this in Prisma Studio:
-- 1. Open http://localhost:5555
-- 2. Click on Genre table
-- 3. Use "Add rows" button or run SQL query
