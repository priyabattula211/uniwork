const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Gig = require('../models/Gig');

const router = express.Router();

router.get('/me', auth, async (req, res) => {
  try {
    const profile = await User.findById(req.userId).select('-passwordHash');

    if (!profile) {
      return res.status(404).json({ message: 'User not found' });
    }

    const postedGigs = await Gig.find({ postedBy: req.userId })
      .populate('applicants', 'name email city')
      .populate('selectedApplicant', 'name email city')
      .sort({ createdAt: -1 });

    const appliedGigs = await Gig.find({ applicants: req.userId })
      .populate('postedBy', 'name email city')
      .sort({ createdAt: -1 });

    return res.json({ profile, postedGigs, appliedGigs });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load profile' });
  }
});

module.exports = router;