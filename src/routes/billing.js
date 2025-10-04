const expressB = require('express');
const routerB = expressB.Router();
const { auth: authB, authorize: authorizeB } = require('../middlewares/auth');
const BillB = require('../models/Bill');
const AppointmentB = require('../models/Appointment');
const TransactionB = require('../models/Transaction');


// Generate bill after consultation
routerB.post('/generate', authB, authorizeB(['doctor','admin']), async (req, res) => {
const { appointmentId, amount } = req.body;
try {
const appt = await AppointmentB.findById(appointmentId);
if (!appt) return res.status(404).json({ message: 'Appt not found' });
const bill = await BillB.create({ appointment: appt._id, patient: appt.patient, doctor: appt.doctor, amount, status: 'pending' });
res.json(bill);
} catch (err) { res.status(500).json({ message: err.message }); }
});


// Simulate online payment (patient)
routerB.post('/pay/:billId', authB, authorizeB('patient'), async (req, res) => {
const { provider } = req.body; // dummy
try {
const bill = await BillB.findById(req.params.billId);
if (!bill) return res.status(404).json({ message: 'Bill not found' });
// simulate payment with random success
const success = Math.random() > 0.2; // 80% success
const tx = await TransactionB.create({ bill: bill._id, amount: bill.amount, provider: provider || 'dummy', success, raw: { simulated: true } });
bill.transaction = tx._id;
bill.status = success ? 'paid' : 'failed';
await bill.save();
res.json({ success, tx });
} catch (err) { res.status(500).json({ message: err.message }); }
});


// Track payment status
routerB.get('/:billId/status', authB, async (req, res) => {
try {
const bill = await BillB.findById(req.params.billId).populate('transaction');
if (!bill) return res.status(404).json({ message: 'Bill not found' });
res.json({ status: bill.status, transaction: bill.transaction });
} catch (err) { res.status(500).json({ message: err.message }); }
});


module.exports = routerB;