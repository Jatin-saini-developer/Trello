import express from 'express';
import Membership from '../models/UserOrgModal.js';
import authMiddleware from '../middleware/authMiddleware.js';
import Board from '../models/boardModal.js';
import Section from '../models/sectionModal.js';
import Issue from '../models/issueModal.js';

const router = express.Router();

router.get('/me/organizations', authMiddleware, async (req, res) => {
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

router.post('/organizations/:orgId/boards', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { orgId } = req.params;
        const { title } = req.body;

        if (!title || title.trim().length === 0) {
            return res.status(400).json({ error: 'Board name is required' });
        }

        // check membership
        const membership = await Membership.findOne({ userId, orgId });
        if (!membership) {
            return res.status(403).json({ error: 'Not a member of this organization' });
        }

        // only admins can create boards
        if (membership.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can create boards' });
        }

        const board = await Board.create({ title, orgId });

        return res.status(201).json({ board });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to create board' });
    }
});

// ── GET sections for a board ──────────────────────────────────────────────────
router.get('/organizations/:orgId/boards/:boardId/sections', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { orgId, boardId } = req.params;

        // Check membership — 403 if not a member of this org
        const membership = await Membership.findOne({ userId, orgId });
        if (!membership) {
            return res.status(403).json({ error: 'Not a member of this organization' });
        }

        const sections = await Section.find({ boardId });

        return res.status(200).json({ sections });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch sections' });
    }
});

// ── GET issues for a board ────────────────────────────────────────────────────
router.get('/organizations/:orgId/boards/:boardId/issues', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { orgId, boardId } = req.params;

        // Check membership — 403 if not a member of this org
        const membership = await Membership.findOne({ userId, orgId });
        if (!membership) {
            return res.status(403).json({ error: 'Not a member of this organization' });
        }

        const issues = await Issue.find({ boardId });

        return res.status(200).json({ issues });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch issues' });
    }
});

export default router;
