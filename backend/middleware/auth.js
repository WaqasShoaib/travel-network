const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Get the full Authorization header
  const authHeader = req.header('Authorization');
  
  console.log('🔍 Full Authorization header:', authHeader);
  
  // Check if Authorization header exists
  if (!authHeader) {
    console.log('❌ No Authorization header found');
    return res.status(401).json({ msg: 'No Authorization header, authorization denied' });
  }
  
  // Check if it starts with 'Bearer '
  if (!authHeader.startsWith('Bearer ')) {
    console.log('❌ Authorization header format incorrect:', authHeader);
    return res.status(401).json({ msg: 'Authorization header must start with "Bearer "' });
  }
  
  // Extract token
  const token = authHeader.split(' ')[1];
  
  console.log('🔍 Extracted token:', token);
  console.log('🔍 Token length:', token ? token.length : 'undefined');
  console.log('🔍 Token starts with:', token ? token.substring(0, 20) + '...' : 'undefined');
  
  if (!token) {
    console.log('❌ No token found after Bearer');
    return res.status(401).json({ msg: 'No token found, authorization denied' });
  }

  // Check if JWT_SECRET exists
  if (!process.env.JWT_SECRET) {
    console.log('❌ JWT_SECRET not found in environment variables');
    return res.status(500).json({ msg: 'Server configuration error' });
  }
  
  console.log('🔍 AUTH - JWT_SECRET exists:', !!process.env.JWT_SECRET);
  console.log('🔍 AUTH - JWT_SECRET length:', process.env.JWT_SECRET.length);
  console.log('🔍 AUTH - JWT_SECRET first 10 chars:', process.env.JWT_SECRET.substring(0, 10));

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token verified successfully for user:', decoded.id);
    req.user = decoded.id;
    next();
  } catch (err) {
    console.error('❌ Token verification failed:', err.message);
    console.error('❌ Error name:', err.name);
    console.error('❌ Full error:', err);
    
    // Provide specific error messages
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ msg: 'Token has expired, please login again' });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        msg: 'Invalid token format',
        debug: {
          error: err.message,
          tokenLength: token.length,
          tokenStart: token.substring(0, 20)
        }
      });
    } else {
      return res.status(401).json({ msg: 'Token verification failed', error: err.message });
    }
  }
};