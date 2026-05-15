const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json()); 

mongoose.connect('mongodb://127.0.0.1:27017/groupP_db')
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

const User = mongoose.model('User', {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    favorites: { type: [String], default: [] } 
});

app.post('/api/register', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json({ message: "Success" });
    } catch (err) { res.status(400).json({ message: "User already exists" }); }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username, password });
        if (user) {
            res.json({ username: user.username, favorites: user.favorites });
        } else {
            res.status(401).json({ message: "Invalid credentials" });
        }
    } catch (err) { res.status(500).json({ message: "Server error" }); }
});

app.post('/api/favorites/toggle', async (req, res) => {
    try {
        const { username, itemId } = req.body;
        const user = await User.findOne({ username });
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const index = user.favorites.indexOf(itemId);
        if (index > -1) {
            user.favorites.splice(index, 1);
        } else {
            user.favorites.push(itemId);
        }
        
        await user.save();
        res.json({ favorites: user.favorites });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

app.get('/api/favorites/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        res.json(user ? user.favorites : []);
    } catch (err) { res.status(500).json({ message: "Error fetching favorites" }); }
});

app.listen(3000, () => console.log('🚀 Backend: http://localhost:3000'));
