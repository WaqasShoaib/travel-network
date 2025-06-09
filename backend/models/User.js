// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  savedLogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TravelLog' }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
