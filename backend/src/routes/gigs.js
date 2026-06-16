const express = require('express');
const Gig = require('../models/Gig');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

function toGeoPoint(location) {
  return {
    type: 'Point',
    coordinates: [Number(location.lng), Number(location.lat)]
  };
}

router.post('/', auth, async (req, res) => {
  try {
    const { title, description, category, type, budget, location } = req.body;

    if (!title || !description || !category || !type || budget === undefined) {
      return res.status(400).json({ message: 'Missing required gig fields' });
    }

    if (!['local', 'global'].includes(type)) {
      return res.status(400).json({ message: 'Invalid gig type' });
    }

    const gigPayload = {
      title,
      description,
      category,
      type,
      budget: Number(budget),
      postedBy: req.userId
    };

    if (type === 'local') {
      if (!location || location.lat === undefined || location.lng === undefined) {
        return res.status(400).json({ message: 'Local gigs require a location' });
      }

      gigPayload.location = toGeoPoint(location);
    }

    const gig = await Gig.create(gigPayload);
    return res.status(201).json(gig);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create gig' });
  }
});

router.get('/local', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.location) {
      return res.status(400).json({ message: 'User location is required for local gigs' });
    }

    const gigs = await Gig.aggregate([
      {
        $geoNear: {
          near: user.location,
          distanceField: 'distance',
          spherical: true,
          maxDistance: 5000,
          query: {
            type: 'local',
            status: 'open'
          }
        }
      },
      {
        $sort: { distance: 1 }
      }
    ]);

    return res.json(gigs);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load local gigs' });
  }
});

router.get('/global', auth, async (req, res) => {
  try {
    const { category } = req.query;
    const query = {
      type: 'global',
      status: 'open'
    };

    if (category) {
      query.category = category;
    }

    const gigs = await Gig.find(query).sort({ createdAt: -1 });
    return res.json(gigs);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load global gigs' });
  }
});

router.post('/:id/apply', auth, async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    if (gig.status !== 'open') {
      return res.status(400).json({ message: 'This gig is no longer open' });
    }

    if (gig.postedBy.toString() === req.userId) {
      return res.status(400).json({ message: 'You cannot apply to your own gig' });
    }

    const alreadyApplied = gig.applicants.some((applicantId) => applicantId.toString() === req.userId);
    if (alreadyApplied) {
      return res.status(400).json({ message: 'You already applied to this gig' });
    }

    gig.applicants.push(req.userId);
    await gig.save();

    return res.json({ message: 'Application submitted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to apply to gig' });
  }
});

router.post('/:id/select', auth, async (req, res) => {
  try {
    const { applicantId } = req.body;
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    if (gig.postedBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only the poster can select an applicant' });
    }

    if (!applicantId) {
      return res.status(400).json({ message: 'applicantId is required' });
    }

    const applicantApplied = gig.applicants.some((id) => id.toString() === applicantId);
    if (!applicantApplied) {
      return res.status(400).json({ message: 'Applicant not found on this gig' });
    }

    gig.selectedApplicant = applicantId;
    gig.status = 'assigned';
    await gig.save();

    return res.json({ message: 'Applicant selected', gig });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to select applicant' });
  }
});

module.exports = router;