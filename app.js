const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');
const cookieParser = require('cookie-parser');
const { createJwtToken, verifyToken } = require('./auth/auth');
const User = require('./model/user');
require('dotenv').config(); // Load environment variables
const app = express();
const port = 3334;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));                        //SSR

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Registration endpoint
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });               // Check if the user already exists

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);           // Hash the password
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login endpoint with JWT
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = createJwtToken({ email: user.email });        // Generate JWT token

    res.cookie('token', token, { httpOnly: true });             // Set the token as a cookie

    res.sendFile(path.join(__dirname, 'public', 'home.html'));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Home route with token verification middleware
app.get('/home', verifyToken, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log('Connected to MongoDB');
    app.listen(port, () => {
      console.log(`Server started at port: ${port}`);
    });
  }).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});
