const expressP = require('express');
const routerP = expressP.Router();
const { auth, authorize } = require('../middlewares/auth');
const DoctorProfileM = require('../models/DoctorProfile');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const PatientProfileM = require('../models/PatientProfile');


// Search doctors by specialization, availability, hospital
routerP.get('/search-doctors', auth, authorize('patient'), async (req, res) => {
  const { specialization, hospital, date } = req.query;
  const filter = {};
  if (specialization) filter.specialization = new RegExp(specialization, 'i');
  if (hospital) filter.hospital = new RegExp(hospital, 'i');
  try {
    let docs = await DoctorProfileM.find(filter).populate('user', 'name email');
    if (date) {
      docs = docs.filter(d => d.availability.some(a => a.date === date));
    }
    res.json(docs);
  } catch (err) { res.status(500).json({ message: err.message }); }
});


// Book appointment
routerP.post('/book', auth, authorize('patient'), async (req, res) => {
  const { doctorId, doctorProfileId, date, slot } = req.body;
  if (!doctorId || !date || !slot) return res.status(400).json({ message: 'Missing fields' });
  try {
    // check slot availability
    const docProfile = await DoctorProfileM.findById(doctorProfileId || doctorId);
    if (!docProfile) return res.status(404).json({ message: 'Doctor not found' });
    const day = docProfile.availability.find(a => a.date === date);
    if (!day || !day.slots.includes(slot)) return res.status(400).json({ message: 'Slot not available' });
    // remove slot
    day.slots = day.slots.filter(s => s !== slot);
    await docProfile.save();
    const dt = new Date(`${date}T${slot}:00`);
    const appt = await Appointment.create({ patient: req.user._id, doctor: docProfile.user, doctorProfile: docProfile._id, datetime: dt, slot });
    res.json(appt);
  } catch (err) { res.status(500).json({ message: err.message }); }
});


// Cancel appointment
routerP.post('/cancel/:id', auth, authorize('patient'), async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: 'Appt not found' });
    if (!appt.patient.equals(req.user._id)) return res.status(403).json({ message: 'Forbidden' });
    
    // Add the slot back to doctor's availability
    const docProfile = await DoctorProfileM.findById(appt.doctorProfile);
    if (docProfile) {
      const appointmentDate = appt.datetime.toISOString().split('T')[0]; // Extract date from datetime
      const day = docProfile.availability.find(a => a.date === appointmentDate);
      
      if (day && !day.slots.includes(appt.slot)) {
        day.slots.push(appt.slot);
        // Optional: Sort slots to maintain order
        day.slots.sort();
        await docProfile.save();
      }
    }
    
    appt.status = 'cancelled';
    await appt.save();
    res.json({ message: 'Cancelled and slot released' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});


// View medical history & prescriptions
routerP.get('/history', auth, authorize('patient'), async (req, res) => {
  try {
    const profile = await PatientProfileM.findOne({ user: req.user._id });
    const prescriptions = await Prescription.find({ patient: req.user._id }).populate('doctor', 'name email');
    const appointments = await Appointment.find({ patient: req.user._id }).populate('doctor', 'name');
    res.json({ profile, appointments, prescriptions });
  } catch (err) { res.status(500).json({ message: err.message }); }
});


module.exports = routerP;