const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
// change User's folder with ../ since I moved the file to another folder
const User = require('../../models/user-model');


passport.use(new LocalStrategy({
  usernameField: 'email' // <== this step we take because we don't use username but email to register and login
  // if we use username we don't have to put this object: {usernameField: 'email'}
}, (email, password, next) => {
  User.findOne({ email: email }) // or simply "{ email }" since the placeholder is the same
  .then(userFromDB => {
    if(!userFromDB){
      return next(null, false, { message: 'Incorrect email!' })
    }
    if(userFromDB.password){
      if(!bcrypt.compareSync(password, userFromDB.password)){
        return next(null, false, { message: 'Incorrect password!' })
      }
    } else {
      return next(null, false, { message: 'This email is used for your social login.' })
    }
    return next(null, userFromDB)
  })
  .catch( err => next(err))
}))