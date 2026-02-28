const mysql = require('mysql2');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

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
