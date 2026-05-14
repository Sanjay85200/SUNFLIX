const path = require('path');
require('dotenv').config();
const express = require('express');
const cors = require('cors');

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

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ message: "SUNFLIX Backend is running!" });
});

// Handle client-side routing: for any GET request that doesn't 
// match an API route or a static file, serve index.html.
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
