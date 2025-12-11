const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  try {
    const secret = process.env.JWT_SECRET || 'change-me-in-env';
    const payload = jwt.verify(token, secret);
    req.user = payload; // contains user id and other fields set at sign
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
