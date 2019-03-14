const express = require('express');
const router  = express.Router();

const Sneaker = require('../models/sneaker-model');
// const User = require('../models/user-model');

const fileUploader = require('../config/upload-setup/cloudinary');

router.get('/sneakers/add', isLoggedIn, (req, res, next) => {
  res.render('sneaker-pages/addSneaker');
});
// above, once it makes it to if isLoggedIn, then it runs the below function, and then jumps back to render the site addressed

// POST route to create a sneaker => has the image uploading
                    // <input type="file" name="imageURL" id="">

router.post('/sneakers/leak-sneaker', fileUploader.single('imageURL'), (req, res, next) => {
  // console.log('body: ', req.body);
  // console.log('- - - - -');
  // console.log('file: ', req.file);
  // console.log("=====", req.body.date);
  let theDate = req.body.date.split('-')
    newDate = (parseInt(theDate[2]) + 1)
    theDate.pop()
    theDate.push(newDate.toString())
    // theDate.join('-')
    // console.log(">>>>>>>>>>>>>>>>>>>> ", theDate);
    
    // console.log(">>>>>>", theDate.join('-'), newDate.toString())

    
  
  const { name, brand, designer, price, description } = req.body; // <= this is ES6 destructuring
  Sneaker.create({
    name,
    brand,
    designer,
    date: theDate.join('-'), // <= let in line 22 to add 1 to the date to be properly recorded
    price,
    description,
    imageURL: req.file.secure_url,
    owner: req.user._id,
  })
  .then( newSneaker => {
    // console.log('sneaker created: ', newSneaker);
    res.redirect(`/sneakers/${newSneaker._id}`);
  })
  .catch( err => next(err) )
})
// Show all the sneakers: 
router.get('/sneakers', (req, res, next) => {
  // in the Sneaker model, property 'owner' is referencing the User model 
  // so in the database collection 'sneakers' one instance will have MongoDB id saved into this property ----
  // _id:ObjectId("5c5f464c8f4c3ae21c6dfba9")                                                                |
  // name:"Air Jordan 3"                                                                                     |
  // description:"The first of many for MJ and Tinker Hatfield"                                              |
  // imageUrl:"https://res.cloudinary.com/djw7xkbip/image/upload/v1549747137/sneakers-ga..."                 |
  // owner:ObjectId("5c5f461e8f4c3ae21c6dfba8") <====== !!! <------------------------------------------------
  //   |
  //   ----------------------
  //                         |
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
      // console.log("----------------------", sneakersFromDB);
      
    })
    res.render('sneaker-pages/sneaker-list', { sneakersFromDB })
  })
})

/////////////////////////// SNEAKER DETAILS PAGE ROUTE ////////////////////////

// get the details of a specific sneaker from the DB
// http://localhost:3000/sneakers/5c70a2e87e2ff325a320936c <== this 'id' will change dynamically when we click on each sneaker
// router.get('/sneakers/:sneakerId') => NOTE: '/sneakers' is pre-filled and ':sneakerId' is just a placeholder, can be any word
router.get('/sneakers/:sneakerId', isLoggedIn, (req, res, next) => {
  // here we need populate owner field - .populate('owner') => we are saying: give me all the details related to the 'owner' field in the sneaker 
  // (there's only owner id there so what it does is-finds the rest of information related to that owner based on the id)
  Sneaker.findById(req.params.sneakerId).populate('owner')
  // we need to populate 'reviews' field and the 'user' field that's inside the reviews
  .populate({path: 'reviews', populate: {path: 'user'}})
  .then(theSneaker => { 
      // if there's a user in a session:
      // console.log("--------------------------", req.user);
      // console.log("==========================", theSneaker);
      
      if(req.user){
        if(theSneaker.owner.equals(req.user._id)){
          theSneaker.isOwner = true;
        }
      }
      // console.log('the sneaker date', theSneaker.date);

      // go through all the reviews and check which ones are created by currently logged in user
      Promise.all(theSneaker.reviews.filter(singleReview => {                             //  |
        if(singleReview.user._id.equals(req.user._id)) {  // <--------------------------------|
        // and if that's the case, create new property in the each review that satisfies criteria
        // and use this property when looping through the array of reviews in hbs file to make sure
        // that logged in user can only edit and delete the reviews they created
          singleReview.canBeChanged = true; 
          singleReview.editId = singleReview._id.toString();
        }
        return singleReview;
      }))
      .then(() => {
        res.render('sneaker-pages/sneaker-details', { sneaker: theSneaker });
      })
      .catch( err => next(err) );
  })
  .catch( err => console.log("Error while getting the details of a sneaker: ", err) );
})

////////////////////////////// EDIT SNEAKERS ROUTE ////////////////////////////////
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
  // let theDate = req.body.date.split('-')
  //   newDate = (parseInt(theDate[2]) + 1)
  //   theDate.pop()
  //   theDate.push(newDate.toString())
  //   // theDate.join('-')
  //   // console.log(">>>>>>", theDate.join('-'), newDate.toString())

  const { name, brand, designer, date, description } = req.body;
  const updatedSneaker = {
    name,
    brand,
    designer,
    // date: theDate.join('-'), // <= let in line 130 to add 1 to the date to be properly recorded
    date,
    description
  };
  // used ES6 destructuring above, otherwise we would have to do 
  // this -> const name = req.body.name; and const description = req.body.description (like below):
  // const updatedSneaker = {
  //   name: req.body.name,
  //   brand: req.body.brand,
  //   designer: req.body.designer,
  //   date: req.body.date,
  //   description: req.body.description,
  // };

  // if user uploads a new image:
  if(req.file){
    updatedSneaker.imageURL = req.file.secure_url
  } 

  Sneaker.findByIdAndUpdate(req.params.id, updatedSneaker)
  .then( theUpdatedSneaker => {
    // console.log("This is updated: ", theUpdatedSneaker);
    res.redirect(`/sneakers/${theUpdatedSneaker._id}`);
    // res.redirect('/sneakers/theUpdatedSneaker._id'); <=wrong way of writing the above
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

// by this function we make sure the route and the functionality is 
// available only if we have user in the session
function isLoggedIn(req, res, next){
  if(req.user){
    next();
  } else {
    res.redirect('/login');
  }
}


module.exports = router;
