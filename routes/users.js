const mongoose = require('mongoose');

const plm = require('passport-local-mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/pin");

const userSchema = mongoose.Schema({
   username: String,
    password: String,
    email: String,
    profileImage: String,
    boards:{
      type: Array,
      default: []
    },
})

userSchema.plugin(plm);

module.exports = mongoose.model("User", userSchema);