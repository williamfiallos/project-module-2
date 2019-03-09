const express = require('express');
const router  = express.Router();

const Sneaker = require('../models/sneaker-model');

router.get('/private', (req, res, next) => {
  if(!req.user){
    req.flash('error', 'You have to be logged in!')
    res.redirect('/login');
    return;
  }
  Sneaker.find({owner:req.user._id}) 
  .then(sneakersFromDB => {
    res.render('user-pages/profile-page', { sneakersFromDB })
  })
});

router.get('/public', (req, res, next) => {
  res.render('user-pages/public-page');
})

module.exports = router;
