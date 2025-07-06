const initdata = require("./data.js");
const Listing = require("../models/listing.js");

const mongoose = require('mongoose');

main()
.then(()=>{console.log("connection is sucessfull")})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/WONDERLUST');
}

const func = async () => {
  await Listing.deleteMany({});

  const ownerId = "685a7ecc0110fa945ecb1f94"; // this should exist in your User collection

const listingsWithOwner = initdata.data.map((obj) => ({
  ...obj,
  owner: ownerId, // ✅ assign single owner
}));

  await Listing.insertMany(listingsWithOwner);
  await Listing.deleteMany({});
  await Listing.insertMany(listingsWithOwner);

   // ✅ Insert updated data
   console.log(listingsWithOwner[0]); // Should have owner field

};

func();