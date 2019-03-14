const express = require('express');
const router = express.Router();
const Sneaker = require('../models/sneaker-model');
const Review = require('../models/review-model');


//////////////////////////////// CREATE A REVIEW /////////////////////////
router.post('/sneakers/:sneakerId/add-review', (req, res, next) => {
  // step 1: create a new review
  const newComment = {
    user: req.user._id,
    comment: req.body.comment,
    canBeChanged: false
  }

  Review.create(newComment)
  .then(theNewComment => {
    // step 2: find the sneaker that the new comment belongs to
    Sneaker.findById(req.params.sneakerId)
    .then(foundSneaker => {
      // when find the sneaker, push the ID of the new comment into the 'reviews' array
      foundSneaker.reviews.push(theNewComment._id);
      // step 3: save the changes just made in the found sneaker
      foundSneaker.save()
      .then(() => {
        res.redirect(`/sneakers/${foundSneaker._id}`)
      })
      .catch(err => next(err));
    })
    .catch(err => next(err));
  })
  .catch(err => next(err));
})

////////////////////// UPDATE REVIEW //////////////////////
router.post('/reviews/:id/update', (req, res, next) => {
  // console.log(req.body);

  Review.findByIdAndUpdate(req.params.id, req.body)
  // Review.findById(req.params.id)
  .then( foundSneaker => {
    console.log("This is updated: ", foundSneaker);
      // res.redirect(`/sneakers/${foundSneaker._id}`);X


    res.redirect('/sneakers')


    // res.redirect('/reviews/theUpdatedReview._id'); <=wrong way of writing the above
    // foundSneaker.comment = req.body.comment
    // foundSneaker.save()
    // .then(updatedSneaker => {
    //   res.redirect(`/sneakers/${updatedSneaker._id}`);
    // })
    // .catch(err => {
    //   next(err)
    // })
  } )
  .catch(err => console.log('Error while saving the updates in the db: ', err));
})

/////////////////////////////// DELETE A REVIEW //////////////////////////////
// since reviews are saved inside the reviews collection and as array of id's in the sneakers' reviews,
// make sure when deleted, the review disappears from the reviews collection and from
// the sneaker's reviews array
router.post('/reviews/:id', (req, res, next) => {
  Review.findByIdAndDelete(req.params.id) // <= deleting review from reviews collection
  .then(() => {
    Sneaker.findOne({'reviews': req.params.id}) // <= find a sneaker that has the review that was deleted from the collections
    .then(foundSneaker => {
      // loop through all the reviews and when find matching id's...
      for(let i=0; i<foundSneaker.reviews.length; i++){
        console.log(foundSneaker.reviews[i]._id.equals(req.params.id))
        if(foundSneaker.reviews[i]._id.equals(req.params.id)){
          // ... use method splice to delete that id from the array
          foundSneaker.reviews.splice(i, 1);
        }
      }
      // make sure to save the changes in the sneaker (I just deleted one review id from its array of reviews, 
      // so that needs to be saved in the database)
      foundSneaker.save()
      .then(() => {
        res.redirect(`/sneakers/${foundSneaker._id}`)
      })
      .catch(err => next(err));
    })
  })
})


module.exports = router;