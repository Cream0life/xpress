const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

//Connect to MonogDB
mongoose
  .connect("mongodb+srv://teststeven:admin123@cluster0.djw7ico.mongodb.net/?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));


const userschema = new mongoose.Schema({
  username: String,
  password: String,
});

const User = mongoose.model("User", userschema);


app.get("/", (req, res) => {
res.send("Hello, Express!");
});

app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    //check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send({ error: "User already exists" });
    }

    //haah the password
    const hashedPassword = await bcrypt.hash(password, 10); // the number 10 here is the salt rounds

    //create a new user and save tho database
    const user = new User({
      username,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).send({ message: "User registered successfully" });
  } catch (error) {
    console.log("User not registered", error); //this error shows up in the logs
    res.status(500).send({ error: "Internl server error" }); // this error is send to the browser.
  }
});

//USer login route
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.log("Useer not found while trying to login in.");
      return res.status(401).send({ error: "Invalid usernamer or password" });
    }
    //Check if the password is coorect
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({ error: "Invalid username or password" });
    }
    //create a JWT token
    const token = jwt.sign({ userId: user._id }, "yourrJWTSecret", {expiresIn: "1h"});
    res.send({ token });
  } catch (error) {
    res.status(500).send({ error: "Internal server Error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
