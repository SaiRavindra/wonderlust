const express = require("express");

const router = express.Router({mergeParams : true});

const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

const ExpressError = require("../utils/ExpressError.js");
const {listingSchema,reviewSchema} = require("../schema.js");
const { isLoggedIn } = require("../middleware.js");




//review upload route

const validatereview = (req,res,next) =>
{
  let {error} = reviewSchema.validate(req.body);
  if(error)
  {
    console.log("error recieved");
    throw new ExpressError(400,"enter valid data");
  }
  else
  {
    next();
  }
}


router.post("/",validatereview,isLoggedIn,wrapAsync(async (req,res)=>
{
  let {id} = req.params;
  let listing = await Listing.findById(id);
  let newreview = new Review(req.body.review);
  listing.author = req.user._id;

  listing.reviews.push(newreview);
  await newreview.save();
  await listing.save();
  req.flash("success","new review added");
  res.redirect(`/listings/${listing._id}`);
}));


//delete review route
router.delete("/:reviewId",isLoggedIn, wrapAsync(async  (req,res)=>
{
  let {id,reviewId} = req.params;
  
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  console.log("delted");
  req.flash("success","review deleted");
  res.redirect(`/listings/${id}`);
}));

module.exports = router;