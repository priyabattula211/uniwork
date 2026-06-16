const mongoose = require('mongoose');

const GigSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    type: { type: String, enum: ['local', 'global'], required: true },
    budget: { type: Number, required: true },
    location: {
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: {
        type: [Number]
      }
    },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    selectedApplicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['open', 'assigned', 'completed'],
      default: 'open'
    },
    createdAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

GigSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Gig', GigSchema);