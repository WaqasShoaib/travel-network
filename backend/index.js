// backend/index.js

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');


// Load environment variables from .env
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Import routes
const authRoutes = require('./routes/auth');
const travelLogRoutes = require('./routes/travelLog');



// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/travellogs', travelLogRoutes);


// Placeholder/test route
app.get('/', (req, res) => {
  res.send('API Running');
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
//  useNewUrlParser: true,
//  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
