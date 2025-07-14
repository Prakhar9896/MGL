import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import User from './model/user.js';
import List from './model/list.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from './database/connection.js';

dotenv.config();
connectDB();
const app= express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.get('/games', (req, res) => {
  const limit = req.query.limit || 10;
  const offset = req.query.offset || 0;

  const search= req.query.search || '' ;

  if(search.length > 0){
    fetch(`https://www.giantbomb.com/api/games/?api_key=${process.env.API_KEY}&format=json&field_list=name,id,guid,image&limit=${limit}&offset=${offset}&sort=date_added:desc&filter=name:${search}`)
    .then(response=>response.json())
    .then(data=>res.json(data))
    .catch(error => {
      console.error(error);
      res.status(500).json({ error: "failed to fetch games" });
    });
    return
  }

  fetch(`https://www.giantbomb.com/api/games/?api_key=${process.env.API_KEY}&format=json&field_list=name,id,guid,image&limit=${limit}&offset=${offset}&sort=date_added:desc`)
    .then(response => response.json())
    .then(data => res.json(data))
    .catch(error => {
      console.error(error);
      res.status(500).json({ error: "failed to fetch games" });
    });
});


app.get('/game/:guid', async (req, res)=>{
    try{
        const { guid }= req.params;
        const response= await fetch(`https://www.giantbomb.com/api/game/${guid}/?api_key=${process.env.API_KEY}&format=json&field_list=name,image,description`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data= await response.json();
        res.json(data);
    }

    catch(err){
        console.log(err);
        res.status(500).json({err: "error fetching the data"});
    }
})

app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const userList = new List({
      userId: newUser._id,
      list: {
        Completed: [],
        Playing: [],
        Wishlist: []
      }
    });

    await userList.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Signup failed' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token, user: {userid: user._id, username: user.username, email: user.email } });

  }
  catch (err) {
    res.status(500).json({ message: 'Login failed' });
  }
});

app.patch('/user/:userID/list',async (req,res)=>{
  try{
    const userID= req.params.userID;
    const {guid , status}= req.body;

    const userlist = await List.findOne({ userId: userID });
    console.log(userlist);
    if(!userlist) {
      console.log("User list not found");
      res.status(404).json({message: "User Id not present in List collection"});
    }

    const list= await userlist.list;
    if(!list) {
      console.log("no list present")
      res.status(404).json({message: "No list present"});
    }

    if (!userlist.list[status].includes(guid)) {
      userlist.list[status].push(guid);
    } else {
      return res.status(409).json({ message: "Game already exists in the list" });
    }

    await userlist.save();
    res.status(200).json({message:"Game added successfully"});
  }
  catch(err){
    res.status(500).json({ message: "List not Updated" });
  }
});

app.get('/list', async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: 'Missing userId in query parameters' });
  }

  try {
    const userList = await List.findOne({ userId });

    if (!userList) {
      return res.status(404).json({ message: 'List not found for the given userId' });
    }

    res.status(200).json(userList);
  } catch (err) {
    console.error('Error fetching user list:', err);
    res.status(500).json({ message: 'Server error while fetching user list' });
  }
});

app.listen(PORT, () => {
    console.log('Server Running on Port: ', PORT);
})

