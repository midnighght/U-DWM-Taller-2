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
