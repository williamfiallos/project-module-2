const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sneakerSchema = new Schema({
  brand: { type: String },
  designer: { type: String },
  date: { type: Date },
  price: { type: Number },
  description: { type: String },
  imageURL: { type: String },
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  // comment: [], // <= ask how to reference to 'comment model'
})

const Sneaker = mongoose.model('Sneaker', sneakerSchema);
module.exports = Sneaker;