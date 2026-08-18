import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/userModal.js';
import generateToken from '../utils/generateToken.js';

const router = express.Router();

router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check for existing user
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists.",
            });
        }

        // Create user (password is hashed by the pre-save hook in UserModal)
        const user = await User.create({ name, email, password });

        // Generate token
        const token = generateToken(user);

        return res.status(201).json({
            success: true,
            message: "Account created successfully.",
            token,
            // user: user.toPublicJSON(),
        });
    } catch (error) {
        // Handle Mongoose validation errors
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({
                success: false,
                message: "Validation failed.",
                errors: messages,
            });
        }

        console.error("Signup error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });

    }
})

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate request body
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required.",
            });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        // Compare provided password with stored hash
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        // Generate token
        const token = generateToken(user);

        return res.status(200).json({
            success: true,
            message: "Logged in successfully.",
            token,
        });
    } catch (error) {
        console.error("Login error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
})

export default router;