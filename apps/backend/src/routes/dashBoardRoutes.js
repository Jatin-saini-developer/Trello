import express from 'express';
import Membership from '../models/UserOrgModal.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/me/organizations', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const memberships = await Membership.find({ userId }).populate('orgId');

        const orgs = memberships.map((m) => ({
            orgId: m.orgId._id,
            name: m.orgId.name,
            description: m.orgId.description,
            role: m.role
        }));

        return res.status(200).json({ orgs });


    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch organizations' });
    }


})

router.get('/organizations/:orgId/boards', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { orgId } = req.params;

        // check membership first — access control
        const membership = await Membership.findOne({ userId, orgId });
        if (!membership) {
            return res.status(403).json({ error: 'Not a member of this organization' });
        }

        const boards = await Board.find({ orgId });

        return res.status(200).json({ boards, role: membership.role });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch boards' });
    }
})