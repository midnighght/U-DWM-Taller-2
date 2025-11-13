// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Pokemon = require('./models/pokemon');

const app = express();
app.use(express.json());
// CORS: allow requests from any origin, including file:// (origin null)
app.use(cors({
  origin: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
// Ensure preflight requests are handled
app.options('*', cors());

const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongodb-pokemon:27017/pokemon_db';
const PORT = process.env.PORT || 5100;

mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> console.log('🔌 Express conectado a MongoDB'))
  .catch(err => {
    console.error('Mongo connection error:', err);
    process.exit(1);
  });

// GET /pokemon -> lista (paginable opcional)
app.get('/pokemon', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '100', 10), 1000);
    const docs = await Pokemon.find().sort({ pokeId: 1 }).limit(limit).lean();
    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /pokemon/:name (case-ins)
app.get('/pokemon/:name', async (req, res) => {
  try {
    const name = req.params.name;
    const doc = await Pokemon.findOne({ name: new RegExp(`^${name}$`, 'i') }).lean();
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/', (req, res) => res.json({ message: 'Express Pokemon API - endpoints: /pokemon, /pokemon/:name' }));

app.listen(PORT, ()=> console.log(`🚀 Express Pokemon API corriendo en puerto ${PORT}`));
