import express from 'express';
import mongoose from 'mongoose';
import Org from '../models/orgModal.js';
import UserOrg from '../models/UserOrgModal.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
    const { name, description } = req.body;

    if (!name || name.trim().length === 0) {
        return res.status(400).json({ message: 'Organization name is required' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.user.id;

        const org = await Org.create([{ name: name.trim(), description }], { session });

        const membership = await UserOrg.create([{
            userId,
            orgId: org[0]._id,
            role: 'admin'
        }], { session });

        await session.commitTransaction();
        return res.status(201).json({ org: org[0], membership: membership[0] });

    } catch (error) {
        await session.abortTransaction();
        console.error('Create org error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    } finally {
        session.endSession();
    }
});

export default router;
