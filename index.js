const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const { Pool, Client } = require("pg");

// const { MongoClient, ServerApiVersion } = require("mongodb");
// const uri =
//   "mongodb+srv://Pandianrp:Pandianrp94@atlascluster.ybk7k91.mongodb.net/userList?retryWrites=true&w=majority";
// const client = new MongoClient(uri, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   serverApi: ServerApiVersion.v1,
// });
// client.connect((err) => {
//   const collection = client.db("userProfiles").collection("login");
//   // perform actions on the collection object
//   client.close();
// });

// async function run() {
//   try {
//     await client.connect();

//     const collection = client.db("userProfile").collection("login");
//     // perform actions on the collection object
//     const first = await collection.find();
//     console.log(first);
//     client.close();
//   } catch {
//     throw new error("db not connected!");
//   }
// }

// const { Schema } = mongoose;
// let userSchema = new Schema({
//   userName: { type: String, required: true },
//   email: { type: String },
//   passWord: { type: String },
//   address: { type: String },
//   phoneNumber: { type: String },
// });

// let user = mongoose.model("user", userSchema);
// const createAndSavePerson = (done) => {
//   let userOne = new user({
//     userName: req.body.userName,
//     email: req.body.email,
//     passWord: req.body.passWord,
//     address: req.body.address,
//     phoneNumber: req.body.phoneNumber,
//   });
//   userOne.save(function (err, data) {
//     if (err) console.log(err);
//     done(null, data);
//   });
// };

const pool = new Pool({
  type: "postgres",
  user: "pandianr",
  host: "localhost",
  database: "postgres",
  password: "root",
  port: 5432,
});

app.use(bodyParser.json());
app.use(cors());

const jwtToken = "Secret-key";

app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  const userExists = await (
    await pool.connect()
  ).query(`SELECT * FROM accounts WHERE email = '${email}'`);

  if (userExists.rows.length > 0) {
    res.send({
      status: "ERROR",
      message: "User already present!",
    });
  }

  if (userExists.rows.length < 1) {
    const name = req.body.name;
    const password = req.body.password;
    const saltRounds = 10;
    const passWord = await bcrypt.hash(password, saltRounds);
    const matching = await bcrypt.compare(password, passWord);
    const sec = { name, passWord };
    const accountId = Math.floor(Math.random() * 1000);
    const newAccount = { ...sec, email, accountId };

    const sql = `INSERT INTO accounts (email,accountId,name,password) VALUES ('${email}','${accountId}','${name}','${passWord}')`;
    pool.query(sql, (err, res) => {
      console.log(err, res);
    });

    res.send({
      status: "SUCCESS",
      data: newAccount,
      message: "account registered successfully!",
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const userExists = await (
      await pool.connect()
    ).query(`SELECT * FROM accounts WHERE email = '${email}'`);
    if (userExists.rows.length > 0) {
      let user = userExists.rows[0];
      let hashedPass = user.password;
      console.log("hasssshhhhheddeed", hashedPass);
      const matching = await bcrypt.compare(password, hashedPass);
      console.log(matching);
      if (matching === true) {
        const payload = {
          email: email,
          accountId: user.accountId,
        };
        const secret = "your-secret-key";
        const options = { expiresIn: "1h" };
        const token = jwt.sign(payload, secret, options);
        console.log("----------------", token);
        res.send({
          status: "SUCCESS",
          data: token,
          message: "login successfully!",
        });
      } else {
        res.send({
          status: "ERROR",
          message: "Incorrect passWord!",
        });
      }
    } else throw new Error("User doesnot exists!");
  } catch (err) {
    res.send({
      status: "ERROR",
      message: err.message,
    });
  }
});
// const hashedPassWord = await bcrypt.hash(passWord, 10);
// const isMatch = await bcrypt.compare(hashedPassWord, passWord);
// console.log(isMatch);
// if (!isMatch) {
//   throw new Error("Unable to login");
// } else {
//   const token = jwt.sign({ SECRET_KEY });
//   User.tokens = User.tokens.concat({ token });
//   await user.save();
//       res.send({
//         status: "SUCCESS",
//         message: "user authentication verified successfully",
//         data: User,
//         token,
//       });
//     }
//   } catch (err) {
//     return err.message;
//   }
// });

app.listen(3000, async () => {
  // await pool.connect();
  // pool.query(
  //   "CREATE TABLE accounts (accountId INT PRIMARY KEY, name VARCHAR(100), email VARCHAR(100), password VARCHAR(250))",
  //   (err, res) => {
  //     console.log(err, res);
  //   }
  // );
  console.log("Server started");
});
