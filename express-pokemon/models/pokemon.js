// models/pokemon.js
const mongoose = require('mongoose');

const PokemonSchema = new mongoose.Schema({
  pokeId: { type: Number, index: true },   // id from PokeAPI
  name: { type: String, required: true, unique: true },
  types: [String],
  height: Number,
  weight: Number,
  sprite: String,
  short: String, // short description if available
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pokemon', PokemonSchema);
