const { Schema: S, model: M } = require('mongoose');
const DoctorProfileSchema = new S({
user: { type: S.Types.ObjectId, ref: 'User', required: true },
specialization: { type: String, required: true },
hospital: { type: String },
fee: { type: Number, default: 0 },
// availability stored as array of {date, slots: ['09:00','09:30']}
availability: [{ date: String, slots: [String] }],
createdAt: { type: Date, default: Date.now }
});
module.exports = M('DoctorProfile', DoctorProfileSchema);