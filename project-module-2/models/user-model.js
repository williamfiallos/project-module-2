const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: String,
  password: String,
  fullName: String,
  // followers: { type: Schema.Types.ObjectId, ref: 'User ID' } // <= ask how to reference 'User ID' to push followers
  
  // CHECK .env FILE TO HAVE GOOGLE AND/OR SLACK API'S!!!
  // slack:
  // slackID: String,
  // google:
  // googleID: String
}, {
  timestamps: true
})

const User = mongoose.model('User', userSchema);

module.exports = User;
// module.exports = mongoose.model('User', userSchema); // <= same as above just new way to export (without variable)