var express = require('express');
var router = express.Router();
const userModel = require("./users")
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
res.redirect("/newProfile",{nav: true})
})

router.get('/newProfile',async function(req,res,next){
  const user =await userModel.findOne({username: req.session.passport.user})
  res.render("newProfile", {user,nav: true})
})

router.post('/register', function(req,res,next){
  const data = new userModel({
    username: req.body.username,
    email: req.body.email,
  })
  userModel.register(data, req.body.password)
  .then(function(){
    passport.authenticate("local")(req,res, function(){
      res.redirect("/newProfile", {nav: true})
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
