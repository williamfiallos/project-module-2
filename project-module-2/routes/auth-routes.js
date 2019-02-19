// Step 2: After creating user-model.js, then create auth-routes.js and user-routes.js

const express = require('express');
const router = express.Router();

const passport = require('passport');

const User = require('../models/user-model');

const bcrypt = require('bcryptjs');
const bcryptSalt = 10;

router.get('/signup', (req, res, next) => {
  res.render('auth/signup');
})

// action="/register"
router.post('/signup', (req, res, next) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userFullName = req.body.fullName;

  if(userEmail == '' || userPassword == '' || userFullName == ''){
    req.flash('error', 'Please fill all the fields.')
    res.render('auth/signup');
    return;
  }

  User.findOne({ email: userEmail })
  .then(foundUser => {
    if(foundUser !== null ){
      req.flash('error', 'Sorry, there is already user with the same email!');
      // here we will redirect to '/login' 
      res.redirect('/login');
      return;
    }
    
    const salt = bcrypt.genSaltSync(bcryptSalt);
    // console.log(' = == = == = =  ', userPassword, salt)
    const hashPassword = bcrypt.hashSync(userPassword, salt);

      User.create({
        email: userEmail,
        password: hashPassword,
        fullName: userFullName
      })
      .then(user => {
        // if all is good, log in the user automatically
        // redirect to login page
        // console.log('redirecting to another page:', user);
        req.login(user, (err) => {
          if(err){
            // req.flash.error = 'some message here' (same as below)
            req.flash('error', 'Auto login does not work so please log in manually');
            res.redirect('/login');
            return;
          }
          res.redirect('/private');
        })
      })
      .catch( err => next(err)); //closing User.create()
  })
  .catch( err => next(err)); // closing User.findOne();
})

/////////////////////     LOGIN     ///////////////////
router.get('/login', (req, res, next) => {
  res.render('auth/login');
})

router.post('/login', passport.authenticate('local', {
  successRedirect: '/private', // <== successsfully logged in
  failureRedirect: '/login', // <== login failed so go to '/login' to try again
  failureFlash: true,
  passReqToCallback: true
}))


/////////////////////     LOGOUT     /////////////////////

router.post('/logout', (req, res, next) => {
  req.logout(); // <== logout method comes from passport and takes care of the destroying the session
    res.redirect('/login')
})


module.exports = router;

/////////////////////     SLACK LOGIN     //////////////////////
// router.get('/slack-login', passport.authenticate('slack'));

// // callbackURL: '/slack/callback' // <= from 'slack-strategy.js'
// router.get('/slack/callback', passport.authenticate('slack', {
//   successReturnToOrRedirect: '/private',
//   successFlash: 'Slack login successful!',
//   failureRedirect: '/login',
//   failureMessage: 'Slack login failed. Please try to login manually.'
// }))

// /////////////////////     GOOGLE LOGIN     //////////////////////
// router.get("/google-login", passport.authenticate("google", {
//   scope: ["https://www.googleapis.com/auth/plus.login",
//           "https://www.googleapis.com/auth/plus.profile.emails.read"]
// }));

// router.get("/google/callback", passport.authenticate("google", {
//   successRedirect: "/private",
//   successMessage: 'Google login successful!',
//   failureRedirect: "/login",
//   failureMessage: 'Google login failed. Please try to login manually.'
  
// }));