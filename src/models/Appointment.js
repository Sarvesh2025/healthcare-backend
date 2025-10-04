const { Schema: SA, model: MA } = require('mongoose');
const AppointmentSchema = new SA({
patient: { type: SA.Types.ObjectId, ref: 'User', required: true },
doctor: { type: SA.Types.ObjectId, ref: 'User', required: true },
doctorProfile: { type: SA.Types.ObjectId, ref: 'DoctorProfile' },
datetime: { type: Date, required: true },
slot: { type: String },
status: { type: String, enum: ['booked','cancelled','completed'], default: 'booked' },
createdAt: { type: Date, default: Date.now }
});
module.exports = MA('Appointment', AppointmentSchema);