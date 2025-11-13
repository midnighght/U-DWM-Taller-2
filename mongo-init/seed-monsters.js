// Mongo init script executed by official mongo image on first container start.
// Ensures the 'dnd' database has a 'monsters' collection seeded with sample data.

const dbName = 'monstersDB';
const collectionName = 'monsters';

const db = db.getSiblingDB(dbName);

// Create collection if missing
if (!db.getCollectionNames().includes(collectionName)) {
	db.createCollection(collectionName);
}

// Ensure unique index on 'index' field
db[collectionName].createIndex({ index: 1 }, { unique: true });

const count = db[collectionName].countDocuments();
if (count === 0) {
	print(`Seeding '${collectionName}' collection in '${dbName}' database...`);
	db[collectionName].insertMany([
		{
			index: 'goblin',
			favorite: false,
			name: 'Goblin',
			size: 'Small',
			type: 'humanoid',
			alignment: 'neutral evil',
			armor_class: [{ type: 'leather', value: 15 }],
			hit_points: 7,
			speed: { walk: '30 ft.' },
			strength: 8,
			dexterity: 14,
			constitution: 10,
			intelligence: 10,
			wisdom: 8,
			charisma: 8,
			senses: { passive_perception: 9 },
			challenge_rating: 0.25,
			image: '',
			url: '/monsters/goblin'
		},
		{
			index: 'ogre',
			favorite: false,
			name: 'Ogre',
			size: 'Large',
			type: 'giant',
			alignment: 'chaotic evil',
			armor_class: [{ type: 'hide', value: 11 }],
			hit_points: 59,
			speed: { walk: '40 ft.' },
			strength: 19,
			dexterity: 8,
			constitution: 16,
			intelligence: 5,
			wisdom: 7,
			charisma: 7,
			senses: { passive_perception: 8 },
			challenge_rating: 2,
			image: '',
			url: '/monsters/ogre'
		}
	]);
	print('Seed completed.');
} else {
	print(`Collection '${collectionName}' already has ${count} documents. Skipping seed.`);
}

// ============================================
// SEED POKEMON DATABASE
// ============================================
const pokeDbName = 'pokemon_db';
const pokeCollectionName = 'pokemons';

print(`\n=== Starting Pokemon DB seed ===`);
const pokeDb = db.getSiblingDB(pokeDbName);
print(`Switched to database: ${pokeDbName}`);

// Create collection if missing
if (!pokeDb.getCollectionNames().includes(pokeCollectionName)) {
	print(`Creating collection: ${pokeCollectionName}`);
	pokeDb.createCollection(pokeCollectionName);
}

// Ensure unique index on 'pokeId' field
print(`Creating unique index on pokeId...`);
pokeDb[pokeCollectionName].createIndex({ pokeId: 1 }, { unique: true });

const pokeCount = pokeDb[pokeCollectionName].countDocuments();
print(`Current document count: ${pokeCount}`);

if (pokeCount === 0) {
	print(`Seeding '${pokeCollectionName}' collection in '${pokeDbName}' database...`);
	pokeDb[pokeCollectionName].insertMany([
		{ pokeId: 1, name: "bulbasaur", types: ["grass","poison"], height: 7, weight: 69, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png", short: "Seed Pokémon" },
		{ pokeId: 4, name: "charmander", types: ["fire"], height: 6, weight: 85, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png", short: "Lizard Pokémon" },
		{ pokeId: 7, name: "squirtle", types: ["water"], height: 5, weight: 90, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png", short: "Tiny Turtle Pokémon" },
		{ pokeId: 25, name: "pikachu", types: ["electric"], height: 4, weight: 60, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png", short: "Mouse Pokémon" },
		{ pokeId: 39, name: "jigglypuff", types: ["normal","fairy"], height: 5, weight: 55, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/39.png", short: "Balloon Pokémon" },
		{ pokeId: 94, name: "gengar", types: ["ghost","poison"], height: 15, weight: 405, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png", short: "Shadow Pokémon" },
		{ pokeId: 143, name: "snorlax", types: ["normal"], height: 21, weight: 4600, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png", short: "Sleeping Pokémon" },
		{ pokeId: 150, name: "mewtwo", types: ["psychic"], height: 20, weight: 1220, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png", short: "Genetic Pokémon" }
	]);
	print('✅ Pokemon seed completed - 8 Pokemon inserted.');
} else {
	print(`⏭️  Collection '${pokeCollectionName}' already has ${pokeCount} documents. Skipping pokemon seed.`);
}
print(`=== Pokemon DB seed finished ===\n`);
