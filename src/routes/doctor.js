const expressD = require('express');
const routerD = expressD.Router();
const { auth: authD, authorize: authorizeD } = require('../middlewares/auth');
const AppointmentD = require('../models/Appointment');
const PrescriptionD = require('../models/Prescription');
const DoctorProfileD = require('../models/DoctorProfile');


// Doctor: view today's appointments
routerD.get('/today', authD, authorizeD('doctor'), async (req, res) => {
try {
const start = new Date(); start.setHours(0,0,0,0);
const end = new Date(); end.setHours(23,59,59,999);
const appts = await AppointmentD.find({ doctor: req.user._id, datetime: { $gte: start, $lte: end }, status: 'booked' }).populate('patient', 'name email');
res.json(appts);
} catch (err) { res.status(500).json({ message: err.message }); }
});


// Update diagnosis & prescriptions (after consultation)
routerD.post('/prescribe/:appointmentId', authD, authorizeD('doctor'), async (req, res) => {
const { notes, medicines } = req.body;
try {
const appt = await AppointmentD.findById(req.params.appointmentId);
if (!appt) return res.status(404).json({ message: 'Appt not found' });
if (!appt.doctor.equals(req.user._id)) return res.status(403).json({ message: 'Forbidden' });
appt.status = 'completed';
await appt.save();
const pres = await PrescriptionD.create({ appointment: appt._id, doctor: req.user._id, patient: appt.patient, notes, medicines });
// update patient history
const PatientProfile = require('../models/PatientProfile');
const p = await PatientProfile.findOne({ user: appt.patient });
p.medicalHistory.push({ date: new Date(), notes, prescriptions: medicines, doctor: req.user._id });
await p.save();
res.json(pres);
} catch (err) { res.status(500).json({ message: err.message }); }
});


// Mark availability (time slots)
routerD.post('/availability', authD, authorizeD('doctor'), async (req, res) => {
const { date, slots } = req.body; // slots = ['09:00','09:30']
try {
let profile = await DoctorProfileD.findOne({ user: req.user._id });
if (!profile) {
profile = await DoctorProfileD.create({ user: req.user._id, specialization: 'General' });
}
const day = profile.availability.find(a => a.date === date);
if (day) {
// merge unique slots
const set = new Set([...day.slots, ...slots]);
day.slots = [...set];
} else {
profile.availability.push({ date, slots });
}
await profile.save();
res.json(profile);
} catch (err) { res.status(500).json({ message: err.message }); }
});


module.exports = routerD;