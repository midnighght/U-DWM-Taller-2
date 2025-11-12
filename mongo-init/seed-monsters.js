// Initializes dnd monsters collection with sample data if empty
// Run automatically via Docker MONGO_INITDB_ROOT_USERNAME/PASSWORD environment.

db = db.getSiblingDB('dnd');

const collection = 'monsters';
if (!db.getCollection(collection)) {
  db.createCollection(collection);
}

const existingCount = db[collection].countDocuments();
if (existingCount === 0) {
  print('Seeding initial monsters...');
  db[collection].insertMany([
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
      url: '/api/monsters/goblin'
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
      url: '/api/monsters/ogre'
    }
  ]);
} else {
  print('Monsters collection already seeded, skipping.');
}