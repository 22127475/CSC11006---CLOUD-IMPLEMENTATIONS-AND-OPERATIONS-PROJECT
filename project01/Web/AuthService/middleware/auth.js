const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization
  console.log('Token:', token);

  if (!token) {
    return res.status(401).json({ error: 'Không có quyền truy cập', isAuthenticated: false, tokenFromUser: token, gitChanged: 1 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token không hợp lệ hoặc hết hạn', isAuthenticated: false });
  }
};

module.exports = authMiddleware;
