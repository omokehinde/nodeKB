const mongoose = require('mongoose');


//User schema
const UserSchema = mongoose.Schema({
  name:{
    type: String,
    required: true
  },
  email:{
    type: String,
    required: true,
    unique: true
  },
  username:{
    type: String,
    required: true,
    unique: true
  },
  password:{
    type: String,
    required: true
  }
});

const User = module.exports = mongoose.model('User', UserSchema);

module.exports.getUserByUsername = function(username) {
  let query = {'username':username};
  User.findOne(query);
}

module.exports.getUserByEmail = function(email) {
  let query = {'email':email};
  User.findOne(query);
}
