const mongoose = require('mongoose');

const PokemonSchema = new mongoose.Schema({
  pokeId: { type: Number, index: true },   // id pokeAPI
  name: { type: String, required: true, unique: true },
  types: [String],
  height: Number,
  weight: Number,
  sprite: String,
  short: String, // descripcion corta
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pokemon', PokemonSchema);
