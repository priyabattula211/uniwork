const request = require('supertest');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Gig = require('../src/models/Gig');
const { authHeader } = require('./helpers');

describe('UniWORK API', () => {
  describe('POST /api/auth/signup', () => {
    test('creates a user successfully with coordinates', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Ada Lovelace',
          email: 'ada@example.com',
          password: 'Password123!',
          city: 'London',
          lat: 51.5074,
          lng: -0.1278
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.token).toBeTruthy();
      expect(response.body.user.email).toBe('ada@example.com');

      const user = await User.findOne({ email: 'ada@example.com' });
      expect(user).toBeTruthy();
      expect(user.location.coordinates).toEqual([-0.1278, 51.5074]);
    });

    test('rejects duplicate email', async () => {
      const passwordHash = await bcrypt.hash('Password123!', 10);
      await User.create({
        name: 'Existing User',
        email: 'duplicate@example.com',
        passwordHash,
        city: 'Delhi',
        location: { type: 'Point', coordinates: [77.2, 28.6] }
      });

      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'New User',
          email: 'duplicate@example.com',
          password: 'Password123!',
          city: 'Delhi',
          lat: 28.61,
          lng: 77.21
        });

      expect(response.statusCode).toBe(409);
    });

    test('rejects missing required fields', async () => {
      const response = await request(app).post('/api/auth/signup').send({ email: 'missing@example.com' });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    test('logs in successfully', async () => {
      const passwordHash = await bcrypt.hash('Password123!', 10);
      await User.create({
        name: 'Login User',
        email: 'login@example.com',
        passwordHash,
        city: 'Delhi',
        location: { type: 'Point', coordinates: [77.2, 28.6] }
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@example.com', password: 'Password123!' });

      expect(response.statusCode).toBe(200);
      expect(response.body.token).toBeTruthy();
    });

    test('rejects wrong password', async () => {
      const passwordHash = await bcrypt.hash('Password123!', 10);
      await User.create({
        name: 'Wrong Password User',
        email: 'wrongpass@example.com',
        passwordHash,
        city: 'Delhi',
        location: { type: 'Point', coordinates: [77.2, 28.6] }
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'wrongpass@example.com', password: 'WrongPassword!' });

      expect(response.statusCode).toBe(401);
    });

    test('rejects non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'missing@example.com', password: 'Password123!' });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /api/gigs', () => {
    let token;
    let userId;

    beforeEach(async () => {
      const passwordHash = await bcrypt.hash('Password123!', 10);
      const user = await User.create({
        name: 'Poster',
        email: 'poster@example.com',
        passwordHash,
        city: 'Delhi',
        location: { type: 'Point', coordinates: [77.209, 28.6139] }
      });

      userId = user._id.toString();
      token = authHeader(userId);
    });

    test('creates a local gig with location', async () => {
      const response = await request(app)
        .post('/api/gigs')
        .set(token)
        .send({
          title: 'Local Gig',
          description: 'Need help nearby',
          category: 'delivery',
          type: 'local',
          budget: 50,
          location: { lat: 28.6142, lng: 77.21 }
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.type).toBe('local');
      expect(response.body.location.coordinates).toEqual([77.21, 28.6142]);
    });

    test('creates a global gig', async () => {
      const response = await request(app)
        .post('/api/gigs')
        .set(token)
        .send({
          title: 'Global Gig',
          description: 'Remote work',
          category: 'writing',
          type: 'global',
          budget: 75
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.type).toBe('global');
    });

    test('rejects local gig without location', async () => {
      const response = await request(app)
        .post('/api/gigs')
        .set(token)
        .send({
          title: 'Bad Local Gig',
          description: 'Missing location',
          category: 'repairs',
          type: 'local',
          budget: 50
        });

      expect(response.statusCode).toBe(400);
    });

    test('rejects invalid gig type', async () => {
      const response = await request(app)
        .post('/api/gigs')
        .set(token)
        .send({
          title: 'Invalid Gig',
          description: 'Bad type',
          category: 'design',
          type: 'hybrid',
          budget: 50
        });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /api/gigs/:id/apply', () => {
    let poster;
    let applicant;
    let gig;

    beforeEach(async () => {
      poster = await User.create({
        name: 'Poster',
        email: 'poster2@example.com',
        passwordHash: await bcrypt.hash('Password123!', 10),
        city: 'Delhi',
        location: { type: 'Point', coordinates: [77.209, 28.6139] }
      });
      applicant = await User.create({
        name: 'Applicant',
        email: 'applicant@example.com',
        passwordHash: await bcrypt.hash('Password123!', 10),
        city: 'Delhi',
        location: { type: 'Point', coordinates: [77.22, 28.615] }
      });

      gig = await Gig.create({
        title: 'Apply Gig',
        description: 'Need help',
        category: 'delivery',
        type: 'local',
        budget: 50,
        location: { type: 'Point', coordinates: [77.21, 28.614] },
        postedBy: poster._id,
        applicants: []
      });
    });

    test('applies successfully once', async () => {
      const response = await request(app)
        .post(`/api/gigs/${gig._id}/apply`)
        .set(authHeader(applicant._id.toString()));

      expect(response.statusCode).toBe(200);

      const updatedGig = await Gig.findById(gig._id);
      expect(updatedGig.applicants.map(String)).toContain(applicant._id.toString());
    });

    test('rejects duplicate apply', async () => {
      gig.applicants.push(applicant._id);
      await gig.save();

      const response = await request(app)
        .post(`/api/gigs/${gig._id}/apply`)
        .set(authHeader(applicant._id.toString()));

      expect(response.statusCode).toBe(400);
    });

    test('rejects poster applying to own gig', async () => {
      const response = await request(app)
        .post(`/api/gigs/${gig._id}/apply`)
        .set(authHeader(poster._id.toString()));

      expect(response.statusCode).toBe(400);
    });

    test('rejects when gig is not open', async () => {
      gig.status = 'assigned';
      await gig.save();

      const response = await request(app)
        .post(`/api/gigs/${gig._id}/apply`)
        .set(authHeader(applicant._id.toString()));

      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /api/gigs/:id/select', () => {
    let poster;
    let applicant;
    let gig;

    beforeEach(async () => {
      poster = await User.create({
        name: 'Poster',
        email: 'poster3@example.com',
        passwordHash: await bcrypt.hash('Password123!', 10),
        city: 'Delhi',
        location: { type: 'Point', coordinates: [77.209, 28.6139] }
      });
      applicant = await User.create({
        name: 'Applicant',
        email: 'applicant3@example.com',
        passwordHash: await bcrypt.hash('Password123!', 10),
        city: 'Delhi',
        location: { type: 'Point', coordinates: [77.22, 28.615] }
      });

      gig = await Gig.create({
        title: 'Select Gig',
        description: 'Need help',
        category: 'delivery',
        type: 'local',
        budget: 50,
        location: { type: 'Point', coordinates: [77.21, 28.614] },
        postedBy: poster._id,
        applicants: [applicant._id]
      });
    });

    test('poster selects applicant successfully', async () => {
      const response = await request(app)
        .post(`/api/gigs/${gig._id}/select`)
        .set(authHeader(poster._id.toString()))
        .send({ applicantId: applicant._id.toString() });

      expect(response.statusCode).toBe(200);

      const updatedGig = await Gig.findById(gig._id);
      expect(updatedGig.status).toBe('assigned');
      expect(String(updatedGig.selectedApplicant)).toBe(applicant._id.toString());
    });

    test('rejects non-poster selection attempt', async () => {
      const response = await request(app)
        .post(`/api/gigs/${gig._id}/select`)
        .set(authHeader(applicant._id.toString()))
        .send({ applicantId: applicant._id.toString() });

      expect(response.statusCode).toBe(403);
    });
  });

  describe('GET /api/gigs/local', () => {
    test('returns only gigs within 5km', async () => {
      const user = await User.create({
        name: 'Geo User',
        email: 'geo@example.com',
        passwordHash: await bcrypt.hash('Password123!', 10),
        city: 'Delhi',
        location: { type: 'Point', coordinates: [77.209, 28.6139] }
      });

      await Gig.create({
        title: 'Near Gig',
        description: 'Inside range',
        category: 'delivery',
        type: 'local',
        budget: 40,
        location: { type: 'Point', coordinates: [77.212, 28.615] },
        postedBy: user._id,
        applicants: []
      });

      await Gig.create({
        title: 'Far Gig',
        description: 'Outside range',
        category: 'delivery',
        type: 'local',
        budget: 40,
        location: { type: 'Point', coordinates: [77.35, 28.8] },
        postedBy: user._id,
        applicants: []
      });

      const response = await request(app)
        .get('/api/gigs/local')
        .set(authHeader(user._id.toString()));

      expect(response.statusCode).toBe(200);
      expect(response.body.some((gig) => gig.title === 'Near Gig')).toBe(true);
      expect(response.body.some((gig) => gig.title === 'Far Gig')).toBe(false);
    });
  });
});