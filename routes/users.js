const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const mongoose = require('mongoose');
//const config = require('../config/database');


// Bring in User model
let User = require('../models/user');

// mongoose.connect(config.database);
// let db = mongoose.connection;

// Register Form
router.get('/register', function(req, res) {
  res.render('register');
});

// Register User
router.post('/register', checkIfEmailExist, checkIfUsernameExist, function(req, res) {
  const name = req.body.name;
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const password2 = req.body.password2;

  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not vald').isEmail();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Paswword does not match').equals(req.body.password);

  let errors = req.validationErrors();

  require('../models/user')(email);
  require('../models/user')(username);

  //let parseBodyEmail = JSON.parse(req.body.email);
  //let parseBodyUsername = JSON.parse(req.body.username);

  // to check if email\ exist
  //let emailTaken = getUserByEmail(email);
  // to check if username exist
  //let usernameTaken = getUserByUsername(username);

  if (errors) {
    res.render('register', {
      errors:errors
    });
  } else {
    let newUser = new User({
      name:name,
      email:email,
      username:username,
      password:password
    });

    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(newUser.password, salt, function(err, hash) {
        if (err) {
          console.log(err);
        }
        newUser.password = hash;
        newUser.save(function(err) {
          if (err) {
            console.log(err);
            return;
          } else {
            req.flash('success', 'You are now registered and can log in');
            res.redirect('/users/login');
          }
        });
      });
    });
  }
});

// Login form
router.get('/login', function(req, res) {
  res.render('login');
});

// Logn process
router.post('/login', function(req, res, next) {
  passport.authenticate('local', {
     successRedirect: '/',
     failureRedirect: '/users/login',
     failureFlash: true
   })(req, res, next);
});

// Logout
router.get('/logout', function(req, res) {
  req.logout();
  req.flash('success', 'You are logged out');
  res.redirect('/users/login');
});

function checkIfEmailExist(req, res, next) {
  User.findOne({email:req.body.email}, function (err, user) {
    if (err) {
      console.log(err);
    }
    if (user) {
      req.flash('danger', 'Email in use');
      res.render('register');
    } else {
      return next();
    }
  });
}

function checkIfUsernameExist(req, res, next) {
  User.findOne({email:req.body.username}, function (err, user) {
    if (err) {
      console.log(err);
    }
    if (user) {
      req.flash('danger', 'Username in use');
      res.render('register');
    } else {
      return next();
    }
  });
}

module.exports = router;
