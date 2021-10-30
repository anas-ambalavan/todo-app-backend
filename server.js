const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

require("dotenv").config();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());

// console.log(process.env.MONGODB_CONNECTION_STRING);

mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const connection = mongoose.connection;
connection.once("open", function () {
  console.log("MongoDB database connection established successfully");
});

// app.get("/", (req, res) => {
//   res.send({ name: "anass" });
// });

const todoRouter = require("./routes/api");

app.use("/api", todoRouter);

app.listen(process.env.PORT || 4000, function () {
  console.log("Server is running ");
});
