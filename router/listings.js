const express = require("express");

const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema,reviewSchema} = require("../schema.js");
const {isLoggedIn,isOwner} = require("../middleware.js");//exports so {} to require

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });


router.get("/",wrapAsync(async (req,res)=>
{
  let chats = await Listing.find({});
  res.render("listing/index.ejs",{alllisting : chats});
} ));


//create new 

router.get("/new",isLoggedIn,(req,res)=>
{
  res.render("./listing/new.ejs");
})

//show route

router.get("/:id",wrapAsync(async (req,res)=>
{
  let {id} = req.params;
  const listing = await Listing.findById(id).populate("reviews").populate("owner");//we used populate owner we can direct access them also using listing,owner
  if(!listing)
  {
    req.flash("error","listing no found");
    return res.redirect("/listings");
  }
  res.render("listing/show.ejs",{listing});
}));

//create route

// router.post("/listings",async (req,res,err)=>
// {
//   // let {title,description,image,price,location,country} = req.body;
//   // let newuser = new Listing({
//   //   title : title,
//   //   description : description,
//   //   image : image,
//   //   price : price,
//   //   location :location,
//   //   country : country
//   // })
//   // await newuser.save();
//   try
//   {
//       let newlisting = new Listing(req.body.listing);
//   await newlisting.save();
//   res.redirect("/listings");
//   }
//   catch(err)
//   {
//     next(err);
//   }
// })

const validateListing = (req,res,next) =>
{
  let {error} = listingSchema.validate(req.body);
  if(error)
  {
    throw new ExpressError(400,"enter valid data");
  }
  else
  {
    next();
  }
}

router.post("/",upload.single("listing[image]"),validateListing,wrapAsync(async (req,res,next)=>
{
  // listingSchema.validate(req.body); no need as we are  passing middleware
  //we are using listing schema .validate so commenting this
  // if(!req.body || !req.body.listing)
  // {
  //   throw new ExpressError(400,"send valid data for listing");
  // }
  let url = req.file.path;
  let filename = req.file.filename;
  let newlisting = new Listing(req.body.listing);
  newlisting.owner = req.user._id;
  newlisting.image = {url,filename};
  await newlisting.save();
  req.flash("success","new listing added");
  res.redirect("/listings");
}));

//edit route

router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(async (req,res)=>
{
  let {id} = req.params;
  let listing = await Listing.findById(id);
  if(!listing)
  {
    req.flash("error","listing no found");
    return res.redirect("/listings");
  }
  req.flash("success","Listing edited");
  res.render("./listing/edit.ejs",{listing});
}));

//update route

router.put("/:id",validateListing,isLoggedIn,isOwner, wrapAsync(async (req, res, next) => {
  let { id } = req.params;
  //as validation listing we dont need this
  // if(!req.body || !req.body.listing)
  // {
  //   throw new ExpressError(400,"send valid data for listing");
  // }
  let updatedListing = await Listing.findByIdAndUpdate(id, req.body.listing);
  req.flash("success","Listing updated");
  res.redirect("/listings");
}));

//delete route

router.delete("/:id",isLoggedIn,isOwner, wrapAsync(async (req, res, next) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  req.flash("success","Listing deleted");
  res.redirect("/listings");
}));


module.exports = router;