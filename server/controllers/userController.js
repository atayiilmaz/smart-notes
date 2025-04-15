const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Sign up user
const signup = async (req, res) => {
    try {
        const { email, password, username } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const user = new User({ email, password, username });
        await user.save();

        res.status(201).json({
            message: 'User registered successfully'
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get user profile
const getProfile = async (req, res) => {
    res.json({
        user: {
            id: req.user._id,
            email: req.user.email,
            username: req.user.username
        }
    });
};

module.exports = {
    signup,
    login,
    getProfile
};
