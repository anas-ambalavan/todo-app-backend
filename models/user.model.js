const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let User = Schema({
  email: String,
  pass: String,
});

module.exports = mongoose.model("users", User);
