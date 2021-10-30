const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

let Todo = require("../models/todo.model");
let User = require("../models/user.model");

function findExpiry() {
  const date = new Date();
  date.setDate(date.getDate() + 60);
  return date.toISOString();
}

function verifyToken(req, res, next) {
  // Get auth header value
  const bearerHeader = req.headers["authorization"];
  // Check if bearer is undefined
  if (typeof bearerHeader !== "undefined") {
    // Split at the space
    const bearer = bearerHeader.split(" ");
    // Get token from array
    const bearerToken = bearer[1];

    jwt.verify(bearerToken, process.env.SECRET_KEY, (err, authData) => {
      if (err || !authData) {
        return res.status(401).json({ message: "Unauthorized" });
      } else {
        // Set the userID
        req.userId = authData.insertedId;

        // Next middleware
        next();
      }
    });
  } else {
    // Forbidden
    return res.status(401).json({ message: "Unauthorized" });
  }
}

router.get("/user/validate", verifyToken, function (req, res) {
  let id = req.userId;
  res.json({ data: id });
});

router.post("/user/register", (req, res) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!err && user) {
      return res.status(400).json({ message: "User Already Exists" });
    }
    User.collection.insertOne(req.body, (err, user) => {
      if (err) {
        console.log(err);
      } else {
        const insertedId = user.insertedId.toString();
        jwt.sign(
          { insertedId },
          process.env.SECRET_KEY,
          { expiresIn: "50d" },
          (err, token) => {
            if (err) {
              console.log(err);
            } else {
              res.json({
                result: "success",
                token: token,
                userId: insertedId,
                expiryDate: findExpiry(),
              });
            }
          }
        );
      }
    });
  });
});

router.post("/user/login", (req, res) => {
  User.collection.findOne(
    { email: req.body.email, pass: req.body.pass },
    (err, user) => {
      if (err && !user) {
        console.log(err);
        return res.status(400).json({ message: "Login failed" });
      } else {
        const insertedId = user._id;
        jwt.sign(
          { insertedId },
          process.env.SECRET_KEY,
          { expiresIn: "50d" },
          (err, token) => {
            if (err) {
              console.log(err);
              return res.status(400).json({ message: "Login failed" });
            } else {
              return res.json({
                result: "success",
                token: token,
                userId: insertedId,
                expiryDate: findExpiry(),
              });
            }
          }
        );
      }
    }
  );
});

router.post("/todos/add", verifyToken, function (req, res) {
  Todo.create(
    { userId: req.userId, text: req.body.text, completed: req.body.completed },
    (err, todo) => {
      if (err) {
        console.log(err);
      } else {
        res.json(todo);
      }
    }
  );
});

router.get("/todos/fetch", verifyToken, (req, res) => {
  Todo.find({ userId: req.userId }, function (err, todos) {
    if (err) {
      console.log(err);
    } else {
      res.json(todos);
    }
  });
});

router.delete("/todos/delete/:id", verifyToken, (req, res) => {
  Todo.findByIdAndDelete(req.params.id, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.json(result);
    }
  });
});

router.put("/todos/update/:id", verifyToken, function (req, res) {
  Todo.findById(req.params.id, function (err, todo) {
    if (!todo) res.status(404).send({ message: "Todo not found" });
    else {
      Todo.findByIdAndUpdate(req.params.id, req.body)
        .then((todo) => {
          res.json("Todo updated!");
        })
        .catch((err) => {
          res.status(400).send({ message: "Update not possible" });
        });
    }
  });
});

router.get("/todos/:id", function (req, res) {
  let id = req.params.id;
  Todo.findById(id, function (err, todo) {
    res.json(todo);
  });
});

module.exports = router;
