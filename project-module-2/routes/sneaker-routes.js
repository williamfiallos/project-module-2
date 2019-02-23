const express = require('express');
const router  = express.Router();

const Sneaker = require('../models/sneaker-model');
const User = require('../models/user-model');

const fileUploader = require('../config/upload-setup/cloudinary');

router.get('/sneakers/add', isLoggedIn, (req, res, next) => {
  res.render('sneaker-pages/addSneaker');
});
// above, once it makes it to if isLoggedIn, then it runs the below function, and then jumps back to render the site addressed


                    // <input type="file" name="imageURL" id="">

router.post('/sneakers/leak-sneaker', fileUploader.single('imageURL'), (req, res, next) => {
  // console.log('body: ', req.body);
  // console.log('- - - - -');
  // console.log('file: ', req.file);
  const { name, brand, designer, date, price, description } = req.body;
  Sneaker.create({
    name,
    brand,
    designer,
    date,
    price,
    description,
    imageURL: req.file.secure_url,
    owner: req.user._id, // <= error in server, cannot read ._id
    // comment: [], // <= ask how to reference to 'comment model'
  })
  .then( newSneaker => {
    // console.log('sneaker created: ', newSneaker);
    res.redirect('/sneakers');
  })
  .catch( err => next(err) )
})

router.get('/sneakers', (req, res, next) => {
  Sneaker.find().populate('owner') // .populate allows us to find a user other than by ._id, in this case 'owner'
  .then(sneakersFromDB => {
    sneakersFromDB.forEach(oneSneaker => {
      // each sneaker has the 'owner' property which is user's id
      // if owner (the id of the user who created a sneaker) is the same as the currently logged in user
      // then create additional property in the 'oneSneaker' object (maybe 'isOwner' is not the best one but ... 🤯)
      // and that will help you to allow that currently logged in user can edit and delete only the sneakers they created
      
      // if there's a user in a session:
      if(req.user){
        if(oneSneaker.owner.equals(req.user._id)){
          oneSneaker.isOwner = true;
        }
      }
    })
    res.render('sneaker-pages/sneaker-list', { sneakersFromDB })
  })
})


function isLoggedIn(req, res, next){
  if(req.user){
    next();
  } else {
    res.redirect('/login');
  }
}
////////////////////////////// EDIT ROOMS ROUTE ////////////////////////////////
// - - - - - - - - - - - - - - - - - GET - - - - - - - - - - - - - - - - - - -//
// http://localhost:3000/sneakers/5c70a2e87e2ff325a320936c/edit
router.get('/sneakers/:id/edit', (req, res, next) => {
  Sneaker.findById(req.params.id)
  .then( foundSneaker => {
    // console.log(foundSneaker)
    res.render('sneaker-pages/editSneaker', { sneaker: foundSneaker }) // <= Note: 'foundSneaker' new name becomes 'sneaker'

  })
  .catch(err => console.log('Error while getting the details for sneaker edit: ', err));
})
// - - - - - - - - - - - - - - - - - POST - - - - - - - - - - - - - - - - - -//
router.post('/sneakers/:id/update',fileUploader.single('imageURL'), (req, res, next) => {
  // console.log("Updates are: ", req.body, req.file); <=req.file is for the image, also note line 91
  
  // note: below are the fields I want to be updated
  const updatedSneaker = {
    name: req.body.name,
    brand: req.body.brand,
    designer: req.body.designer,
    date: req.body.date,
    description: req.body.description,
  };
  // if user uploads a new image:
  if(req.file){
    updatedSneaker.imageURL = req.file.secure_url
  } 

  Sneaker.findByIdAndUpdate(req.params.id, updatedSneaker)
  .then( theUpdatedSneaker => {
    // console.log("Is this updated: ", theUpdatedSneaker);
    // res.redirect(`/sneakers/${updatedSneaker._id}`);
    res.redirect('/sneakers');
  } )
  .catch(err => console.log('Error while saving the updates in the db: ', err));
})

//////////////////////////// SNEAKER DELETE ROUTE //////////////////////////////

// <form action="/sneakers/{{sneaker._id}}/delete" method="POST">
router.post('/sneakers/:id/delete', (req, res, next) => {
  Sneaker.findByIdAndRemove(req.params.id)
  .then(() => {
    res.redirect('/sneakers')
  })
  .catch( err => console.log("Error while deleting the sneaker: ", err))
})

/////////////////////////// SNEAKER DETAILS PAGE ROUTE ////////////////////////

// get the details of a sneaker from the DB
// http://localhost:3000/sneakers/5c70a2e87e2ff325a320936c <== this 'id' will change dynamically when we click on each sneaker
// router.get('/sneakers/:sneakerId') => NOTE: '/sneakers' is pre-filled and ':sneakerId' is just a placeholder, can be any word
router.get('/sneakers/:sneakerId', isLoggedIn, (req, res, next) => {
  const theSneakerId = req.params.sneakerId;
  //.populate('owner') => we are saying: give me all the details related to the 'owner' field in the sneaker 
  // (there's only owner id there so what it does is-finds the rest of information related to that owner based on the id)
  Sneaker.findById(theSneakerId).populate('owner')
  .then(theSneaker => { 
          // if there's a user in a session:
          if(req.user){
            if(theSneaker.owner.equals(req.user._id)){
              theSneaker.isOwner = true;
            }
          }
    // console.log("The requested Sneaker is: ", theSneaker);
    res.render('sneaker-pages/sneaker-details', { sneaker: theSneaker });
  })
  .catch( err => console.log("Error while getting the details of a sneaker: ", err) );
})

module.exports = router;
