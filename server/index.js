const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

// Signup Route - Handling userId as requested
app.post('/api/signup', async (req, res) => {
    const { name, mobile, email, password } = req.body;
    // We'll use email as the 'userId' to satisfy the schema requirement while keeping email functionality
    const userId = email;

    console.log("Signup attempt for userId:", userId);

    try {
        const [existing] = await db.query('SELECT * FROM users WHERE userId = ?', [userId]);
        if (existing.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query(
            'INSERT INTO users (userId, name, mobile, password) VALUES (?, ?, ?, ?)',
            [userId, name, mobile, hashedPassword]
        );

        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Server error", details: error.message });
    }
});

// Login Route
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const userId = email;

    try {
        const [users] = await db.query('SELECT * FROM users WHERE userId = ?', [userId]);
        if (users.length === 0) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user.id, userId: user.userId }, JWT_SECRET, { expiresIn: '1h' });

        res.json({
            token,
            user: {
                id: user.id,
                userId: user.userId,
                name: user.name
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
