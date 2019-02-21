// Step 1: Beginning project I downloaded Irongenerate to download all necessary packages needed for this project.


require('dotenv').config();

const bodyParser   = require('body-parser');
const cookieParser = require('cookie-parser');
const express      = require('express');
const favicon      = require('serve-favicon');
const hbs          = require('hbs');
const mongoose     = require('mongoose');
const logger       = require('morgan');
const path         = require('path');

const session = require('express-session');

// import passport docs from config folder
const passportSetup = require('./config/passport/passport-setup');


// REGISTER THE PARTIALS (ANYWHERE IN THE FILE)
hbs.registerPartials(__dirname + '/views/partials');


mongoose
  .connect('mongodb://localhost/project-module-2', {useNewUrlParser: true})
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Error connecting to mongo', err)
  });

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Express View engine setup

app.use(require('node-sass-middleware')({
  src:  path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));
      

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));



// default value for title local
app.locals.title = 'Express - Generated with IronGenerator';

///////// ASK QUESTION ABOUT SESSION!!! WHERE IS THE SECRET FROM? //////////
// handle session here:
// app.js
app.use(session({
  secret: "our-passport-local-strategy-app",
  resave: true,
  saveUninitialized: true
}));

// moved passport code from here and pasted it to 'passport-setup.js' under config/passport/ 
// into a function and call the function below AFTER session. It MUST come after the session:
passportSetup(app);

const index = require('./routes/index');
app.use('/', index);

// Step 3: require auth-routes so the app knows they exist
app.use('/', require('./routes/auth-routes'));
app.use('/', require('./routes/user-routes'));
app.use('/', require('./routes/sneaker-routes'));


module.exports = app;


// package.json "dependencies": {
//   "passport-google-oauth": "^1.0.0",
//   "passport-slack": "0.0.7",
// },