const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sneakerSchema = new Schema({
  name: { type: String },
  brand: { type: String },
  designer: { type: String },
  date: { type: Date },
  price: { type: Number },
  description: { type: String },
  imageURL: { type: String },
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }] // is an array 
  // comment: [], // <= ask how to reference to 'comment model'
})

const Sneaker = mongoose.model('Sneaker', sneakerSchema);
module.exports = Sneaker;