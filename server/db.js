require('dotenv').config();
const mysql = require('mysql2');

if (!process.env.DB_HOST) {
    console.error("❌ DATABASE CONFIG ERROR: DB_HOST is missing.");
    console.error("Please add DB_HOST to your Render Environment variables.");
} else {
    console.log(`📡 Attempting connection to: ${process.env.DB_HOST.substring(0, 5)}...`);
}

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Final Robust DB Sync
const syncDB = async () => {
    try {
        const connection = await pool.promise().getConnection();

        // Ensure base table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                userId VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create movies table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS movies (
                id INT PRIMARY KEY AUTO_INCREMENT,
                title VARCHAR(255) NOT NULL,
                poster_path TEXT,
                backdrop_path TEXT,
                overview TEXT,
                type ENUM('movie', 'anime') DEFAULT 'movie',
                genre VARCHAR(100),
                vote_average DECIMAL(3,1)
            )
        `);

        // Check if movies exist, if not seed them
        const [rows] = await connection.query('SELECT COUNT(*) as count FROM movies');
        if (rows[0].count === 0) {
            console.log("🌱 Seeding initial movies and animes...");
            const initialMovies = [
                // Movies
                { title: 'Interstellar', poster_path: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6vCU67oYvbpvP.jpg', type: 'movie', genre: 'Sci-Fi', vote_average: 8.7 },
                { title: 'Inception', poster_path: 'https://image.tmdb.org/t/p/w500/9gk7Fn9sVAsOX79p9G93U36v30m.jpg', type: 'movie', genre: 'Action', vote_average: 8.8 },
                { title: 'The Dark Knight', poster_path: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDp92SKyYw9ebS75mH0.jpg', type: 'movie', genre: 'Action', vote_average: 9.0 },
                { title: 'Avatar: The Way of Water', poster_path: 'https://image.tmdb.org/t/p/w500/t6S3Tpu60uKhvCgtkyI7qHLoDLX.jpg', type: 'movie', genre: 'Adventure', vote_average: 7.7 },
                { title: 'Spider-Man: No Way Home', poster_path: 'https://image.tmdb.org/t/p/w500/1g0dhYtWySSTZTOp2Xvp9Ua79Z.jpg', type: 'movie', genre: 'Action', vote_average: 8.0 },
                // Animes
                { title: 'Naruto Shippuden', poster_path: 'https://image.tmdb.org/t/p/w500/987vS2i97O5yXz9p0L3m8M9j5U5.jpg', type: 'anime', genre: 'Action', vote_average: 8.6 },
                { title: 'Attack on Titan', poster_path: 'https://image.tmdb.org/t/p/w500/8C6mYm8u1EUKT3ZIn5rO30S6d6d.jpg', type: 'anime', genre: 'Action', vote_average: 9.1 },
                { title: 'One Piece', poster_path: 'https://image.tmdb.org/t/p/w500/khRKhkhD3I3rXG7G7z7LpEa5mI5.jpg', type: 'anime', genre: 'Shonen', vote_average: 8.9 },
                { title: 'Demon Slayer', poster_path: 'https://image.tmdb.org/t/p/w500/n7vSlLAnG7K7Y6M3m8Z6B5F4yX.jpg', type: 'anime', genre: 'Fantasy', vote_average: 8.7 },
                { title: 'Jujutsu Kaisen', poster_path: 'https://image.tmdb.org/t/p/w500/6vH57tM3Z9z2vR3L8I5u8Y9H9mY.jpg', type: 'anime', genre: 'Supernatural', vote_average: 8.8 }
            ];

            for (const movie of initialMovies) {
                await connection.query(
                    'INSERT INTO movies (title, poster_path, type, genre, vote_average) VALUES (?, ?, ?, ?, ?)',
                    [movie.title, movie.poster_path, movie.type, movie.genre, movie.vote_average]
                );
            }
            console.log("✅ Seeding complete.");
        }

        const [columns] = await connection.query('SHOW COLUMNS FROM users');
        const columnNames = columns.map(c => c.Field.toLowerCase());

        // Fix 'phone' column if it exists and is NOT NULL
        if (columnNames.includes('phone')) {
            await connection.query('ALTER TABLE users MODIFY phone VARCHAR(20) NULL');
            console.log("Fixed: Made 'phone' nullable.");
        }

        // Fix 'username' column if it exists and is NOT NULL
        if (columnNames.includes('username')) {
            await connection.query('ALTER TABLE users MODIFY username VARCHAR(255) NULL');
            console.log("Fixed: Made 'username' nullable.");
        }

        // Add 'name' and 'mobile' (used by our app)
        if (!columnNames.includes('name')) {
            await connection.query('ALTER TABLE users ADD COLUMN name VARCHAR(255) NULL');
            console.log("Added 'name' column.");
        }
        if (!columnNames.includes('mobile')) {
            await connection.query('ALTER TABLE users ADD COLUMN mobile VARCHAR(20) NULL');
            console.log("Added 'mobile' column.");
        }

        console.log("Database schema synchronized for SUNFLIX.");
        connection.release();
    } catch (err) {
        console.error("Database sync error:", err);
    }
};

syncDB();

module.exports = pool.promise();
