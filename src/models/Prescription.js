const { Schema: SP, model: MP } = require('mongoose');
const PrescriptionSchema = new SP({
appointment: { type: SP.Types.ObjectId, ref: 'Appointment', required: true },
doctor: { type: SP.Types.ObjectId, ref: 'User' },
patient: { type: SP.Types.ObjectId, ref: 'User' },
notes: String,
medicines: [String],
createdAt: { type: Date, default: Date.now }
});
module.exports = MP('Prescription', PrescriptionSchema);