var express = require('express');
var router = express.Router();
const userModel = require("./users")
const postModel = require("./post")
const passport = require("passport")
const localStrategy = require("passport-local")
const multer = require('multer');
const upload = require('./multer');

passport.use(new localStrategy(userModel.authenticate()))

router.get('/', function(req, res, next) {
  res.render('index', {nav : false});
});

router.get('/register', function(req,res,next){
  res.render('register', {nav : false});
})

router.post('/fileupload', isLoggedIn, upload.single("image"), async function(req,res,next){
const user = await userModel.findOne({username: req.session.passport.user})
user.profileImage = req.file.filename;
await user.save();
res.redirect("/newProfile")
})

router.get('/newProfile', isLoggedIn, async function(req,res,next){
  const user =await userModel
  .findOne({username: req.session.passport.user})
  .populate("posts")
  res.render("newProfile", {user,nav: true})
})

router.get('/show/posts', isLoggedIn, async function(req,res,next){
  const user =await userModel
  .findOne({username: req.session.passport.user})
  .populate("posts")
  res.render("show", {user,nav: true})
})

router.get('/feed', isLoggedIn, async function(req,res,next){
  const user =await userModel.findOne({username: req.session.passport.user})
  const posts = await postModel.find().populate("user")
  res.render("feed", {user,posts,nav: true})
})

router.get('/show/posts/fullview', isLoggedIn, async function(req,res,next){
  const user =await userModel
  .findOne({username: req.session.passport.user})
  .populate("posts")
  res.render("show", {user,nav: true})
})

router.get('/add',isLoggedIn, async function(req,res,next){
  const user =await userModel.findOne({username: req.session.passport.user})
  res.render("add", {user,nav: true})
})

router.post('/createPost',isLoggedIn, upload.single("postimage"), async function(req,res,next){
  try {
    const user = await userModel.findOne({ username: req.session.passport.user });
    const post = await postModel.create({
      user: user._id,
      title: req.body.title,
      description: req.body.description,
      image: req.file.filename,
    });
    user.posts.push(post._id);
    await user.save();
    res.redirect("/newProfile");
  } catch (err) {
    // Handle the Multer or other errors
    console.error(err);
    res.status(500).send("Internal Server Error");
  }

})

router.post('/register', function(req,res,next){
  const data = new userModel({
    username: req.body.username,
    email: req.body.email,
    name: req.body.fullname,
  })
  userModel.register(data, req.body.password)
  .then(function(){
    passport.authenticate("local")(req,res, function(){
      res.redirect("/newProfile")
    })
  })
  }) 

router.post('/login', passport.authenticate("local", {
  successRedirect: "/newProfile",
  failureRedirect: "/",
}), function(req, res,next){ 
});

router.get('/logout', isLoggedIn, function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/", {nav: false});
}

module.exports = router;
