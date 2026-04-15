const express = require('express');
const path = require('path');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.MONGO_DB_NAME || 'sortingVisualizer';
const COLLECTION_NAME = process.env.MONGO_COLLECTION || 'history';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

let historyCollection;

async function initDatabase() {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    historyCollection = db.collection(COLLECTION_NAME);
    await historyCollection.createIndex({ created_at: -1 });
}

app.get('/api/history', async (req, res) => {
    try {
        const rows = await historyCollection
            .find({})
            .sort({ created_at: -1 })
            .limit(20)
            .toArray();
        res.json(rows.map(row => ({
            id: row._id,
            algorithm: row.algorithm,
            size: row.size,
            speed: row.speed,
            duration_ms: row.duration_ms,
            time_complexity: row.time_complexity,
            space_complexity: row.space_complexity,
            array_data: row.array_data,
            created_at: row.created_at
        })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/history', async (req, res) => {
    const { algorithm, array, size, speed, duration, time_complexity, space_complexity } = req.body;
    if (!algorithm || !Array.isArray(array) || typeof duration !== 'number') {
        return res.status(400).json({ error: 'Invalid request body' });
    }

    const createdAt = new Date();
    try {
        const result = await historyCollection.insertOne({
            algorithm,
            array_data: array,
            size,
            speed,
            duration_ms: duration,
            time_complexity: time_complexity || '',
            space_complexity: space_complexity || '',
            created_at: createdAt
        });
        res.status(201).json({
            id: result.insertedId,
            algorithm,
            size,
            speed,
            duration: duration,
            time_complexity: time_complexity || '',
            space_complexity: space_complexity || '',
            created_at: createdAt
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/history', async (req, res) => {
    try {
        const result = await historyCollection.deleteMany({});
        res.json({ deletedCount: result.deletedCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/visualize', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/visualize.html'));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

initDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server started at http://localhost:${PORT}`);
            console.log(`Connected to MongoDB at ${MONGO_URI}`);
        });
    })
    .catch(err => {
        console.error('Failed to initialize database:', err);
        process.exit(1);
    });
