const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const { db } = require('./models/User');
require('dotenv').config();

const { PORT, MONGO_URI } = process.env;

async function connectDB() {
    await mongoose.connect(MONGO_URI, { autoIndex: true });

    console.log('MongoDB connected');
}

async function main() {
    await connectDB();

    const app = express();
    app.use(cors());
    app.use(express.json({ limit: '1mb' }));
    app.use(morgan('dev'));

    // Health check endpoint
    app.get('/health', (req, res) => res.json({ ok: true }));

    // Mount routes
    app.use('/api', require('./routes'));

    // 404 error handler
    app.use((req, res) => res.status(404).json({ message: 'Not Found' }));

    app.use((err, req, res, next) => {
        console.log(err);
        res.status(err.statusCode || 500).json({ message: err.message || 'Something went wrong' });
    })

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

main().catch((e) => {
    console.error('Failed to start server:', e);
    process.exit(1);
})