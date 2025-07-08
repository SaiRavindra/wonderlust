const mongoose = require('mongoose');
const initData = require('./data.js');
const Listing = require('../models/listing.js');

const MONGO_URL = 'mongodb://127.0.0.1:27017/WONDERLUST';

async function main() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('✅ MongoDB connection successful');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1); // Exit the process if DB connection fails
  }
}

const seedDB = async () => {
  try {
    await Listing.deleteMany({});
    console.log('🗑️ All listings deleted');

    const ownerId = '685a7ecc0110fa945ecb1f94'; // ⚠️ Make sure this User exists in the DB

    const listingsWithOwner = initData.data.map((obj) => ({
      ...obj,
      owner: ownerId,
    }));

    await Listing.insertMany(listingsWithOwner);
    console.log(`🌱 Inserted ${listingsWithOwner.length} listings`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔒 MongoDB connection closed');
  }
};

main().then(seedDB);
