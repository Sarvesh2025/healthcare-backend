const { Schema: SB, model: MB } = require('mongoose');
const BillSchema = new SB({
appointment: { type: SB.Types.ObjectId, ref: 'Appointment' },
patient: { type: SB.Types.ObjectId, ref: 'User' },
doctor: { type: SB.Types.ObjectId, ref: 'User' },
amount: { type: Number, required: true },
status: { type: String, enum: ['pending','paid','failed'], default: 'pending' },
transaction: { type: SB.Types.ObjectId, ref: 'Transaction' },
createdAt: { type: Date, default: Date.now }
});
module.exports = MB('Bill', BillSchema);