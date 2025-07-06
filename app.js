const express = require("express");
const app = express();
const path = require("path");
const Listing = require("./models/listing.js");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("express-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
require("dotenv").config();

const dbUrl = process.env.ATLASDB_URL;

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionoptions =
{
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie : 
  {
    expires : Date.now() + 7*24*60*60*1000,
    maxAge :  7*24*60*60*1000,
    httpOnly : true
  }
}

app.use(session(sessionoptions));
app.use(flash());
  
//passport only after session

//refer passport local mongoose
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));


// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});//always after app.use(flash)


const listingsRouter = require("./router/listings.js");
const reviewsRouter = require("./router/reviews.js");
const usersRouter = require("./router/user.js");



app.use(methodOverride('_method')); // This allows overriding methods with ?_method=PUT or _method input
app.engine("ejs",ejsMate);

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


const mongoose = require('mongoose');



main()
.then(()=>{console.log("connection is sucessfull")})
.catch(err => console.log(err));



async function main() {
  await mongoose.connect(dbUrl);
  console.log('connected');
}



app.get("/", (req,res)=>
{
  res.send("this is root path");
})

// app.get("/demouser",async (req,res)=>
// {
//   let fakeUser = new User({
//     email: "abc@gmail.com",
//     username : "abc"
//   })

//   let registeredUser = await User.register(fakeUser,"helllo");
//   res.send(registeredUser);
// })

app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",usersRouter);


// app.get("/testlisting", wrapAsync(async (req,res)=>
// {
//   let user1 = new Listing({
//     title : "new villa",
//     description : "beautiful vila",
//     price : 5000,
//     location : " Anantapur",
//     country : "India",
//   });
//   await user1.save()
//   .then(()=>{console.log("data addes")})
//   .catch(()=>console.log());
// }));




app.use((req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});



// //default route for non defined route
// app.all('*', (req, res, next) => {
//   next(new ExpressError(404, "Page not found"));
// });

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).send(message);
});



app.listen("8080", ()=>
{
  console.log("listening on port 8080");
})


