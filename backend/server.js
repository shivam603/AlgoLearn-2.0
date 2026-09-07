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

let historyCollection = null;
let statsCollection = null;
let visitorCount = 1428;
const inMemoryHistory = [];

async function initDatabase() {
    try {
        const client = new MongoClient(MONGO_URI, { serverSelectionTimeoutMS: 2000 });
        await client.connect();
        const db = client.db(DB_NAME);
        historyCollection = db.collection(COLLECTION_NAME);
        statsCollection = db.collection('stats');
        await historyCollection.createIndex({ created_at: -1 });
        
        const metricDoc = await statsCollection.findOne({ _id: 'site_metrics' });
        if (metricDoc && typeof metricDoc.visitor_count === 'number') {
            visitorCount = metricDoc.visitor_count;
        }
        console.log(`Connected to MongoDB at ${MONGO_URI}`);
    } catch (err) {
        console.warn(`[AlgoLearn Warning] MongoDB not reachable at ${MONGO_URI}. Falling back to in-memory history storage.`);
    }
}

app.get('/api/visitors', async (req, res) => {
    try {
        visitorCount++;
        if (statsCollection) {
            await statsCollection.updateOne(
                { _id: 'site_metrics' },
                { $set: { visitor_count: visitorCount } },
                { upsert: true }
            );
        }
        res.json({ visitors: visitorCount, success: true });
    } catch (err) {
        res.json({ visitors: visitorCount, success: true });
    }
});

app.get('/api/history', async (req, res) => {
    try {
        if (historyCollection) {
            const rows = await historyCollection
                .find({})
                .sort({ created_at: -1 })
                .limit(20)
                .toArray();
            return res.json(rows.map(row => ({
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
        }
        res.json(inMemoryHistory.slice(0, 20));
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
    const entry = {
        algorithm,
        array_data: array,
        size,
        speed,
        duration_ms: duration,
        time_complexity: time_complexity || '',
        space_complexity: space_complexity || '',
        created_at: createdAt
    };

    try {
        if (historyCollection) {
            const result = await historyCollection.insertOne(entry);
            return res.status(201).json({
                id: result.insertedId,
                ...entry
            });
        }
        entry.id = 'mem_' + Date.now();
        inMemoryHistory.unshift(entry);
        res.status(201).json(entry);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/history', async (req, res) => {
    try {
        if (historyCollection) {
            const result = await historyCollection.deleteMany({});
            return res.json({ deletedCount: result.deletedCount });
        }
        const count = inMemoryHistory.length;
        inMemoryHistory.length = 0;
        res.json({ deletedCount: count });
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

initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`AlgoLearn server running at http://localhost:${PORT}`);
    });
});
