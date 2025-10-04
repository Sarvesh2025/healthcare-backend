const { Schema: Sp, model: Mp } = require('mongoose');
const PatientProfileSchema = new Sp({
user: { type: Sp.Types.ObjectId, ref: 'User', required: true },
age: Number,
gender: String,
medicalHistory: [{ date: Date, notes: String, prescriptions: [String], doctor: { type: Sp.Types.ObjectId, ref: 'User' } }]
});
module.exports = Mp('PatientProfile', PatientProfileSchema);