const express = require("express");

const router = express.Router();
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");

router.get("/signup",(req,res)=>
{
  res.render("user/signup.ejs");
})

router.post("/signup",wrapAsync(async (req,res)=>
{
  try{
  let {username,email,password} = req.body;
  const newUser = new User({email,username});
  const registedUser = await User.register(newUser,password);
  req.login(registedUser, function(err) {
  if (err) { return next(err); }
  req.flash("success","Welcome to WonderLust");
  return res.redirect("/listings");
``});
}
  catch(e)
  {
    req.flash("error","user already exit");
    res.redirect("/signup");
  }

}));

router.get("/login",(req,res)=>
{
  res.render("user/login.ejs");
})

//refer passport node
//after loging calling saveredirect url and savingin localthere and using here
router.post(
  "/login",saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", "Welcome back!");
    res.redirect(res.locals.reDirectUrl || "/listings");
  }
);

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You have successfully logged out.");
    res.redirect("/listings");
  });
});


module.exports = router;

