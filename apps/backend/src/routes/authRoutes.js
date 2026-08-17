import express from 'express';
import User from '../models/userModal';

const router = express.Router;

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
            user: user.toPublicJSON(),
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