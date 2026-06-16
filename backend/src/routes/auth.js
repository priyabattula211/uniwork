const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { geocodeCity } = require('../utils/geocode');

const router = express.Router();

function createToken(user) {
  return jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function serializeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    city: user.city,
    location: user.location,
    createdAt: user.createdAt
  };
}

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, city, location, lat, lng } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    let resolvedCity = typeof city === 'string' ? city.trim() : '';
    let coordinates = null;

    if (lat !== undefined && lng !== undefined) {
      coordinates = [Number(lng), Number(lat)];
    } else if (location && location.lat !== undefined && location.lng !== undefined) {
      coordinates = [Number(location.lng), Number(location.lat)];
    } else if (resolvedCity) {
      const geocoded = await geocodeCity(resolvedCity);
      coordinates = [geocoded.lng, geocoded.lat];
      if (!resolvedCity) {
        resolvedCity = geocoded.displayName || city;
      }
    } else {
      return res.status(400).json({ message: 'Provide either coordinates or a city name' });
    }

    if (!coordinates || coordinates.some((value) => Number.isNaN(value))) {
      return res.status(400).json({ message: 'Invalid location data' });
    }

    if (!resolvedCity) {
      resolvedCity = city || '';
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      passwordHash,
      city: resolvedCity,
      location: {
        type: 'Point',
        coordinates
      }
    });

    return res.status(201).json({ token: createToken(user), user: serializeUser(user) });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to create account' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    return res.json({ token: createToken(user), user: serializeUser(user) });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to sign in' });
  }
});

module.exports = router;