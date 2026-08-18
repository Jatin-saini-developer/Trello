import jwt from 'jsonwebtoken';

/**
 * Generates a signed JWT for the given user.
 * @param {Object} user - Mongoose user document
 * @returns {string} - Signed JWT token
 */
const generateToken = (user) => {
    const payload = {
        id: user._id,
        email: user.email,
        name: user.name,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    return token;
};

export default generateToken;
