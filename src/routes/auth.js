const expressA = require('express');
const { body, validationResult } = require('express-validator');
const jwtA = require('jsonwebtoken');
const UserA = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const routerA = expressA.Router();


routerA.post('/register', [
    body('name').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('role').optional().isIn(['patient', 'doctor', 'admin'])
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { name, email, password, role } = req.body;
    try {
        let existing = await UserA.findOne({ email });
        if (existing) return res.status(400).json({ message: 'Email exists' });
        const user = await UserA.create({ name, email, password, role: role || 'patient' });
        if (user.role === 'patient') {
            await PatientProfile.create({ user: user._id });
        }
        const token = jwtA.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


routerA.post('/login', [
    body('email').isEmail(),
    body('password').notEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { email, password } = req.body;
    try {
        const user = await UserA.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid creds' });
        const ok = await user.comparePassword(password);
        if (!ok) return res.status(400).json({ message: 'Invalid creds' });
        const token = jwtA.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = routerA;