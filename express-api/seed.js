require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const Pokemon = require('./models/pokemon');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongodb-pokemon:27017/pokemon_db';
const POKE_LIMIT = parseInt(process.env.POKE_LIMIT || '50', 10); // default 50, configurable
const MAX_RETRIES = 10;

async function waitForMongo(retries=0){
  try {
    await mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Conectado a MongoDB para seed.');
    return;
  } catch (err) {
    if (retries >= MAX_RETRIES) throw err;
    console.log('Mongo no disponible, reintentando en 2s...');
    await new Promise(r => setTimeout(r, 2000));
    return waitForMongo(retries+1);
  }
}

function fallbackData() {
  // pequeño fallback con 12 pokémon
  return [
    { pokeId: 1, name: "bulbasaur", types: ["grass","poison"], height: 7, weight: 69, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png", short: "Seed Pokémon" },
    { pokeId: 4, name: "charmander", types: ["fire"], height: 6, weight: 85, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png", short: "Lizard Pokémon" },
    { pokeId: 7, name: "squirtle", types: ["water"], height: 5, weight: 90, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png", short: "Tiny Turtle Pokémon" },
    { pokeId: 25, name: "pikachu", types: ["electric"], height: 4, weight: 60, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png", short: "Mouse Pokémon" },
    { pokeId: 39, name: "jigglypuff", types: ["fairy","normal"], height: 5, weight: 55, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/39.png", short: "Balloon Pokémon" },
    { pokeId: 52, name: "meowth", types: ["normal"], height: 4, weight: 42, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/52.png", short: "Scratch Cat Pokémon" },
    { pokeId: 133, name: "eevee", types: ["normal"], height: 3, weight: 65, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png", short: "Evolution Pokémon" },
    { pokeId: 58, name: "growlithe", types: ["fire"], height: 7, weight: 190, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/58.png", short: "Puppy Pokémon" },
    { pokeId: 95, name: "onix", types: ["rock","ground"], height: 88, weight: 2100, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/95.png", short: "Rock Snake Pokémon" },
    { pokeId: 143, name: "snorlax", types: ["normal"], height: 21, weight: 4600, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png", short: "Sleeping Pokémon" },
    { pokeId: 150, name: "mewtwo", types: ["psychic"], height: 20, weight: 1220, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png", short: "Genetic Pokémon" },
    { pokeId: 151, name: "mew", types: ["psychic"], height: 4, weight: 40, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/151.png", short: "New Species Pokémon" }
  ];
}

async function fetchAndSeed(){
  try {
    // connect
    await waitForMongo();
   
    const count = await Pokemon.countDocuments();
    if (count > 0) {
      console.log(`DB ya tiene ${count} pokémon(es). Seed detenido.`);
      process.exit(0);
    }

    console.log(`Intentando descargar primeros ${POKE_LIMIT} pokémon desde PokeAPI...`);

    const listResp = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=${POKE_LIMIT}`);
    const entries = listResp.data.results;

    // fetch individual 
    const chunks = [];
    const concurrency = 6;
    for (let i=0;i<entries.length;i+=concurrency){
      chunks.push(entries.slice(i,i+concurrency));
    }

    const docs = [];
    for (const chunk of chunks){
      const promises = chunk.map(e => axios.get(e.url).then(r => r.data).catch(err => null));
      const results = await Promise.all(promises);
      for (const r of results){
        if (!r) continue;
        const pokeId = r.id;
        const name = r.name;
        const types = r.types.map(t => t.type.name);
        const height = r.height;
        const weight = r.weight;
        const sprite = r.sprites?.front_default || null;
        
        let short = '';
        try {
          const sp = await axios.get(r.species.url);
          
          const enEntry = sp.data.flavor_text_entries.find(f => f.language.name === 'en');
          short = enEntry ? enEntry.flavor_text.replace(/\n|\f/g, ' ') : '';
        } catch (err) {
          short = '';
        }
        docs.push({ pokeId, name, types, height, weight, sprite, short });
      }
      // delay
      await new Promise(r => setTimeout(r, 300));
    }

    if (docs.length === 0) throw new Error('No se obtuvieron pokémon desde PokeAPI');

    await Pokemon.insertMany(docs);
    console.log(`Seed completado: insertados ${docs.length} pokémon(es).`);
    process.exit(0);
  } catch (err) {
    console.error('Seed desde PokeAPI falló:', err.message);
    console.log('Usando fallback local...');
    const fallback = fallbackData();
    try {
      await Pokemon.insertMany(fallback);
      console.log(`Fallback insertado (${fallback.length} pokémon(es)).`);
      process.exit(0);
    } catch (err2) {
      console.error('No se pudo insertar fallback:', err2);
      process.exit(1);
    }
  }
}

fetchAndSeed();
