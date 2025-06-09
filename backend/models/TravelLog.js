// backend/models/TravelLog.js
const mongoose = require('mongoose');

const travelLogSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, required: true },
  location:    { type: String, required: true },
  tags:        [{ type: String }],
  imageUrl:    { type: String },
  imagePublicId: { type: String }, 
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt:   { type: Date, default: Date.now }
});

module.exports = mongoose.model('TravelLog', travelLogSchema);
