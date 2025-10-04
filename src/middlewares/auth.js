const jwt = require('jsonwebtoken');
const User = require('../models/User')


exports.auth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Missing token' });
    const token = authHeader.split(' ')[1];
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = await User.findById(payload.id).select('-password');
        if (!req.user) return res.status(401).json({ message: 'Invalid token' });
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}


exports.authorize = (roles = []) => (req, res, next) => {
    if (!Array.isArray(roles)) roles = [roles];
    if (!roles.length) return next();
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
    next();
}