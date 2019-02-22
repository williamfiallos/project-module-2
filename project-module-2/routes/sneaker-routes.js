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
      // then create additional property in the oneRoom object (maybe isOwner is not the best one but ... 🤯)
      // and that will help you to allow that currently logged in user can edit and delete only the rooms they created
      
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
// http://localhost:3000/rooms/5c5f491110b6c02119f8b475/edit
//////////// EDIT ROOMS ---Get & Post--- ////////////
router.get('/rooms/:id/edit', (req, res, next) => {
  Room.findById(req.params.id)
  .then( foundRoom => {
    // console.log(foundRoom)
    res.render('room-pages/editRoom', { room: foundRoom })

  })
  .catch(err => console.log('Error while getting the details for book edit: ', err));
})


router.post('/rooms/:id/update',fileUploader.single('imageURL'), (req, res, next) => {
  // console.log("Updates are: ", req.body, req.file);

  const updatedRoom = {
    name: req.body.name,
    description: req.body.description
  };
  // if user uplods a new image:
  if(req.file){
    updatedRoom.imageURL = req.file.secure_url
  } 

  Room.findByIdAndUpdate(req.params.id, updatedRoom)
  .then( theUpdRoom => {
    // console.log("Is this updated: ", theUpdRoom);
    // res.redirect(`/books/${updatedBook._id}`);
    res.redirect('/rooms');
  } )
  .catch(err => console.log('Error while saving the updates in the db: ', err));
})



// delete route:
// <form action="/rooms/{{this._id}}/delete" method="POST">
router.post('/rooms/:id/delete', (req, res, next) => {
  Room.findByIdAndRemove(req.params.id)
  .then(() => {
    res.redirect('/rooms')
  })
  .catch( err => console.log("Error while deleting a room: ", err))
})

// get the details of a room from the DB
// http://localhost:3000/rooms/5c52542abbd9c887b58e24a7 <== this 'id' will change dynamically when we click on each room
// router.get('/rooms/:roomId') => '/rooms' is pre-filled and ':roomId' is just a placeholder, can be any word
router.get('/rooms/:roomId', isLoggedIn, (req, res, next) => {
  const theRoomId = req.params.roomId;
  //.populate('owner') => we are saying: give me all the details related to the 'owner' field in the room 
  // (there's only owner id there so what it does is-finds the rest of information related to that owner based on the id)
  Room.findById(theRoomId).populate('owner')
  .then(theRoom => { 
          // // if there's a user in a session:
          // if(req.user){
          //   if(oneRoom.owner.equals(req.user._id)){
          //     oneRoom.isOwner = true;
          //   }
          // }
    // console.log("The requested room is: ", theRoom);
    res.render('room-pages/room-details', { room: theRoom });
  })
  .catch( err => console.log("Error while getting the details of a room: ", err) );
})

module.exports = router;
