const mongoose = require('mongoose');
const Schema  = mongoose.Schema;
const review = require('./review.js');


const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
      url : String,
      filename : String
  },
  price: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
reviews: [
  { 
    type: Schema.Types.ObjectId, 
    ref: 'Review'
  }],
  owner: {
  type: Schema.Types.ObjectId,
  ref: 'User'
}

});

const Listing = mongoose.model('Listing', listingSchema);

listingSchema.post("findOneAndDelete", async function (listing) {
  if (listing) {
    await Review.deleteMany({
      _id: { $in: listing.reviews },
    });
  }
});

module.exports = Listing;



