import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import Section from '../models/sectionModal.js';
import Issue from '../models/issueModal.js';
import Membership from '../models/UserOrgModal.js';

const router = express.Router();

router.post('/:orgId/boards/:boardId/sections', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { orgId, boardId } = req.params;
        const { title } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ error: 'Section title is required' });
        }

        const membership = await Membership.findOne({ userId, orgId });
        if (!membership) {
            return res.status(403).json({ error: 'Not a member of this organization' });
        }

        const section = await Section.create({ title, boardId });

        return res.status(201).json({ section });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to create section' });
    }
});

router.post('/:orgId/boards/:boardId/sections/:sectionId/issues', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { orgId, boardId, sectionId } = req.params;
        const { title, description } = req.body;

        if (!title || !title.trim() || !description || !description.trim()) {
            return res.status(400).json({ error: 'Issue title and description are required' });
        }

        const membership = await Membership.findOne({ userId, orgId });
        if (!membership) {
            return res.status(403).json({ error: 'Not a member of this organization' });
        }

        const issue = await Issue.create({
            title: title.trim(),
            description: description.trim(),
            boardId,
            sectionId,
        });

        return res.status(201).json({ issue });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to create issue' });
    }
});

export default router;
