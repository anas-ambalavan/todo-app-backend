const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let Todo = Schema({
  userId: String,
  text: String,
  completed: Boolean,
});

module.exports = mongoose.model("todos", Todo);
