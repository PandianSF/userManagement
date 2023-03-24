const express = require("express");
const mongoose = require("mongoose");
const Router = require("./router");

const app = express();

app.use(express.json());

// mongoose.connect("mongodb://localhost:27017/usersdb", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

const username = "Pandian";
const password = "Pandian@94";
const cluster = "atlascluster";
const dbname = "mydatabase";

mongoose.connect(
  `mongodb+srv://localhost:27017/${username}:${password}@${cluster}.ybk7k91.mongodb.net/${dbname}?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});

app.use(Router);

app.listen(3000, () => {
  console.log("Server is running at port 3000");
});
