const expressAdm = require('express');
const routerAdm = expressAdm.Router();
const { auth: admAuth, authorize: admAuthorize } = require('../middlewares/auth');
const UserAdm = require('../models/User');
const DoctorProfileAdm = require('../models/DoctorProfile');
const AppointmentAdm = require('../models/Appointment');
const BillAdm = require('../models/Bill');


// Get all doctors (with their profiles)
routerAdm.get('/doctors', admAuth, admAuthorize('admin'), async (req, res) => {
    try {
        const doctors = await UserAdm.find({ role: 'doctor' }).select('-password');
        const doctorsWithProfiles = await Promise.all(
            doctors.map(async (doctor) => {
                const profile = await DoctorProfileAdm.findOne({ user: doctor._id });
                return {
                    _id: doctor._id,
                    name: doctor.name,
                    email: doctor.email,
                    role: doctor.role,
                    specialization: profile?.specialization || 'N/A',
                    hospital: profile?.hospital || 'N/A',
                    fee: profile?.fee || 0,
                    availability: profile?.availability || []
                };
            })
        );
        res.json(doctorsWithProfiles);
    } catch (err) { res.status(500).json({ message: err.message }); }
});


// Add doctor (creates user + doctor profile)
routerAdm.post('/add-doctor', admAuth, admAuthorize('admin'), async (req, res) => {
    const { name, email, password, specialization, hospital, fee } = req.body;
    try {
        let u = await UserAdm.findOne({ email });
        if (u) return res.status(400).json({ message: 'Email exists' });
        u = await UserAdm.create({ name, email, password: password || 'changeme', role: 'doctor' });
        await DoctorProfileAdm.create({ user: u._id, specialization, hospital, fee });
        res.json({ message: 'Doctor added', user: u });
    } catch (err) { res.status(500).json({ message: err.message }); }
});


// Update/Delete doctor
routerAdm.put('/doctor/:id', admAuth, admAuthorize('admin'), async (req, res) => {
    const { name, email, specialization, hospital, fee } = req.body;
    try {
        // Update user
        const u = await UserAdm.findByIdAndUpdate(req.params.id, { name, email }, { new: true });
        // Update doctor profile
        await DoctorProfileAdm.findOneAndUpdate(
            { user: req.params.id },
            { specialization, hospital, fee },
            { new: true, upsert: true }
        );
        res.json({ message: 'Doctor updated successfully', user: u });
    } catch (err) { res.status(500).json({ message: err.message }); }
});
routerAdm.delete('/doctor/:id', admAuth, admAuthorize('admin'), async (req, res) => {
    try {
        await UserAdm.findByIdAndDelete(req.params.id);
        await DoctorProfileAdm.deleteMany({ user: req.params.id });
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});


// Manage appointments & billing records (list)
routerAdm.get('/appointments', admAuth, admAuthorize('admin'), async (req, res) => {
    try {
        const appts = await AppointmentAdm.find().populate('patient doctor');
        res.json(appts);
    } catch (err) { res.status(500).json({ message: err.message }); }
});


routerAdm.get('/bills', admAuth, admAuthorize('admin'), async (req, res) => {
    try {
        const bills = await BillAdm.find().populate('patient doctor transaction');
        res.json(bills);
    } catch (err) { res.status(500).json({ message: err.message }); }
});


// Reports: daily patients, revenue, cancellations
routerAdm.get('/reports/daily', admAuth, admAuthorize('admin'), async (req, res) => {
    const { date } = req.query; // format YYYY-MM-DD
    try {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);
        const patients = await AppointmentAdm.find({ datetime: { $gte: dayStart, $lte: dayEnd }, status: 'completed' }).count();
        const revenueAgg = await BillAdm.aggregate([
            { $match: { createdAt: { $gte: dayStart, $lte: dayEnd }, status: 'paid' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const cancellations = await AppointmentAdm.find({ datetime: { $gte: dayStart, $lte: dayEnd }, status: 'cancelled' }).count();
        res.json({ date, patients, revenue: revenueAgg[0] ? revenueAgg[0].total : 0, cancellations });
    } catch (err) { res.status(500).json({ message: err.message }); }
});


module.exports = routerAdm;