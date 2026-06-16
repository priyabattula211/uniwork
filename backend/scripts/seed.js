require('dotenv').config();

const bcrypt = require('bcryptjs');
const connectDB = require('../src/config/db');
const User = require('../src/models/User');
const Gig = require('../src/models/Gig');

async function seed() {
  await connectDB();

  await Promise.all([User.deleteMany({}), Gig.deleteMany({})]);

  const passwordHash = await bcrypt.hash('password123', 10);

  const users = await User.insertMany([
    {
      name: 'Amina Khan',
      email: 'amina@uniwork.test',
      passwordHash,
      city: 'Delhi',
      location: { type: 'Point', coordinates: [77.209, 28.6139] }
    },
    {
      name: 'Jay Patel',
      email: 'jay@uniwork.test',
      passwordHash,
      city: 'Bengaluru',
      location: { type: 'Point', coordinates: [77.5946, 12.9716] }
    },
    {
      name: 'Noah Reed',
      email: 'noah@uniwork.test',
      passwordHash,
      city: 'Delhi',
      location: { type: 'Point', coordinates: [77.221, 28.632] }
    }
  ]);

  const [amina, jay, noah] = users;

  await Gig.insertMany([
    {
      title: 'Math Tutor for First-Year Calculus',
      description: 'Need help with weekly calculus problem sets near Connaught Place.',
      category: 'tutoring',
      type: 'local',
      budget: 1200,
      location: { type: 'Point', coordinates: [77.2095, 28.6138] },
      postedBy: amina._id,
      applicants: [jay._id, noah._id],
      status: 'open'
    },
    {
      title: 'Same-Day Parcel Drop',
      description: 'Pick up a small parcel and deliver it within central Delhi.',
      category: 'delivery',
      type: 'local',
      budget: 600,
      location: { type: 'Point', coordinates: [77.215, 28.618] },
      postedBy: noah._id,
      applicants: [amina._id],
      status: 'open'
    },
    {
      title: 'Poster Design for Student Event',
      description: 'Create a sharp poster pack for a weekend student meetup.',
      category: 'design',
      type: 'global',
      budget: 2500,
      postedBy: jay._id,
      applicants: [amina._id, noah._id],
      status: 'open'
    },
    {
      title: 'Essay Proofreading Help',
      description: 'Line edit two essays and tighten the structure before submission.',
      category: 'writing',
      type: 'global',
      budget: 1800,
      postedBy: amina._id,
      applicants: [jay._id],
      status: 'open'
    },
    {
      title: 'Fix a Leaky Tap',
      description: 'Quick plumbing repair in a nearby apartment block.',
      category: 'repairs',
      type: 'local',
      budget: 900,
      location: { type: 'Point', coordinates: [77.202, 28.619] },
      postedBy: jay._id,
      applicants: [amina._id],
      status: 'assigned',
      selectedApplicant: amina._id
    },
    {
      title: 'Logo Refresh for Student Club',
      description: 'Modernize an existing club logo and provide export-ready files.',
      category: 'design',
      type: 'global',
      budget: 3200,
      postedBy: noah._id,
      applicants: [amina._id],
      status: 'open'
    },
    {
      title: 'Physics Notes Transcription',
      description: 'Turn handwritten lecture notes into a clean shared document.',
      category: 'writing',
      type: 'global',
      budget: 1400,
      postedBy: jay._id,
      applicants: [noah._id],
      status: 'open'
    },
    {
      title: 'Campus Flyer Delivery',
      description: 'Hand out flyers at a few student-heavy spots this afternoon.',
      category: 'delivery',
      type: 'local',
      budget: 800,
      location: { type: 'Point', coordinates: [77.226, 28.631] },
      postedBy: amina._id,
      applicants: [jay._id, noah._id],
      status: 'open'
    },
    {
      title: 'WordPress Landing Page Cleanup',
      description: 'Fix spacing, buttons, and mobile layout on a small landing page.',
      category: 'design',
      type: 'global',
      budget: 2800,
      postedBy: jay._id,
      applicants: [amina._id],
      status: 'completed'
    },
    {
      title: 'Bike Brake Adjustment',
      description: 'Adjust brake tension and replace worn pads if needed.',
      category: 'repairs',
      type: 'local',
      budget: 700,
      location: { type: 'Point', coordinates: [77.214, 28.628] },
      postedBy: noah._id,
      applicants: [amina._id],
      status: 'open'
    },
    {
      title: 'Resume Review and Cover Letter',
      description: 'Rewrite a resume and create a short tailored cover letter.',
      category: 'writing',
      type: 'global',
      budget: 1600,
      postedBy: amina._id,
      applicants: [jay._id, noah._id],
      status: 'open'
    },
    {
      title: 'Notebook Pickup in Koramangala',
      description: 'Collect office supplies from a nearby shop and drop them off.',
      category: 'delivery',
      type: 'local',
      budget: 650,
      location: { type: 'Point', coordinates: [77.607, 12.971] },
      postedBy: jay._id,
      applicants: [amina._id],
      status: 'open'
    }
  ]);

  console.log('Seed complete');
  process.exit(0);
}

seed().catch((error) => {
  console.error('Seed failed', error);
  process.exit(1);
});