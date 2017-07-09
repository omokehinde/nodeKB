const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const config = require('../config/database');
const bcrypt = require('bcryptjs');

module.exports = function(passport) {
// Local Strategy for Registration
passport.use('local-register', new LocalStrategy(function(req, res, email, username, password, done) {
  //Form Data`



  process.nextTick(function () {

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
  //Find if a user's email and username in the form exist
  User.findOne({'email':email}, {'username':username}, function(err, email, user) {

    //if there are any errors log the error
    if (err) {
      console.log(err);
    }
    if (email) {
      return done(null, false, req.flash('danger', 'Email in use.'));
    }
    if (user) {
      return done(null, false, req.flash('danger', 'Username in use.'));
    }
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
  });
}));

  // Local Strategy for login
  passport.use('local-login', new LocalStrategy(function(username, password, done) {
    // Match username
    let query = {username:username};
    User.findOne(query, function(err, user) {
      if (err) {
        throw err;
      }
      if (!user) {
        return done(null, false, {message:'No user found'});
      }

      // Match Password
      bcrypt.compare(password, user.password, function(err, isMatch) {
        if (err) {
          throw err;
        }
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, {message:'Wrong password'});
        }
      });
    });
  }));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
}
