const path = require('path');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
app.use(cors({
    origin: '*', // For production, you might want to restrict this to your Vercel URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ message: "SUNFLIX Backend is running!" });
});

// Signup Route - Handling userId as requested
app.post('/api/signup', async (req, res) => {
    const { name, mobile, email, password } = req.body;
    const userId = email;

    console.log("📝 Signup attempt for:", userId);

    try {
        const [existing] = await db.query('SELECT * FROM users WHERE userId = ?', [userId]);
        if (existing.length > 0) {
            console.log("⚠️ Signup failed: User already exists:", userId);
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query(
            'INSERT INTO users (userId, name, mobile, password) VALUES (?, ?, ?, ?)',
            [userId, name, mobile, hashedPassword]
        );

        console.log("✅ Signup successful for:", userId);
        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        console.error("❌ Signup Error:", error);
        res.status(500).json({ message: "Server error", details: error.message });
    }
});

// Login Route
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const userId = email;

    console.log("🔑 Login attempt for:", userId);

    try {
        const [users] = await db.query('SELECT * FROM users WHERE userId = ?', [userId]);
        if (users.length === 0) {
            console.log("⚠️ Login failed: User not found:", userId);
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("⚠️ Login failed: Incorrect password for:", userId);
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user.id, userId: user.userId }, JWT_SECRET, { expiresIn: '1h' });

        console.log("✅ Login successful for:", userId);
        res.json({
            token,
            user: {
                id: user.id,
                userId: user.userId,
                name: user.name
            }
        });
    } catch (error) {
        console.error("❌ Login Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Movies Route
app.get('/api/movies', async (req, res) => {
    try {
        const [movies] = await db.query('SELECT * FROM movies');
        res.json(movies);
    } catch (error) {
        console.error("❌ Error fetching movies:", error);
        res.status(500).json({ message: "Server error fetching movies" });
    }
});

// Handle client-side routing: for any GET request that doesn't 
// match an API route or a static file, serve index.html.
// Handle client-side routing
app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
        res.sendFile(path.resolve(__dirname, '../dist/index.html'));
    } else {
        next();
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
