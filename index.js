const express = require('express');
const cors = require('cors');
const mongoose = require('./config/mongoose');
const nodemailer = require('nodemailer'); // Import nodemailer
const User = require('./models/model'); 

const app = express();

app.use(cors()); 
app.use(express.json());

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use any email service provider (e.g., Gmail)
    auth: {
        user: process.env.EMAIL_USER, // Add your email
        pass: process.env.EMAIL_PASS // Add your email password
    }
});

// Route to get all subscribers
app.get('/subscribers', async (req, res) => {
    try {
        const users = await User.find({});
        if (users.length === 0) {
            return res.status(404).json({ message: 'No subscribers found' });
        }
        res.status(200).json(users);
    } catch (error) {
        console.error('Error retrieving users:', error);
        res.status(500).json({ message: 'Error retrieving users', error });
    }
});

// Route to send email
app.post('/send-email', async (req, res) => {
    const { bcc, subject, body } = req.body;

    try {
        const mailOptions = {
            from: process.env.EMAIL_USER, // sender address
            to: '', // Keep empty since it's a BCC
            bcc, // BCC the selected recipients
            subject,
            html: body // Use HTML formatting for the email body
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Email sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Error sending email', error });
    }
});

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
