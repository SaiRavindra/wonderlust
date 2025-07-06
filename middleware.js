// middleware.js
const Listing = require("./models/listing")
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in to access this page.");
    return res.redirect("/login");
  }
  next(); 
};

module.exports.saveRedirectUrl = (req,res,next)=>
{
  if(req.session.redirectUrl)
  {
    res.locals.reDirectUrl = req.session.redirectUrl;
  }
  next();
}

// middleware.js

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);

  if (!listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the owner of this listing");
    return res.redirect(`/listings/${id}`);
  }

  next();
};
