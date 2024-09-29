const express = require('express');
const cors = require('cors');
const mongoose = require('./config/mongoose'); // Ensure this is correctly configured
const User = require('./models/model'); // Importing the User model

const app = express();

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // For parsing application/json

// Route to get all subscribers
app.get('/subscribers', async (req, res) => {
    try {
        const users = await User.find({}); // Get all users
        if (users.length === 0) {
            return res.status(404).json({ message: 'No subscribers found' });
        }
        res.status(200).json(users); // Return all users if found
    } catch (error) {
        console.error('Error retrieving users:', error);
        res.status(500).json({ message: 'Error retrieving users', error });
    }
});

// Route to add a new subscriber
app.post('/subscribe', async (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ message: 'Name and email are required' });
    }

    try {
        // Check if the email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('Same email used');
            return res.status(400).json({ message: 'Email already subscribed' });
        }

        // Create new subscriber
        const newUser = new User({ name, email });
        await newUser.save();

        res.status(201).json({ message: 'User subscribed successfully', user: newUser });
    } catch (error) {
        console.error('Error subscribing user:', error);
        res.status(500).json({ message: 'Error subscribing user', error });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
