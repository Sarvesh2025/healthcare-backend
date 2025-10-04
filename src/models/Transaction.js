const { Schema: ST, model: MT } = require('mongoose');
const TransactionSchema = new ST({
bill: { type: ST.Types.ObjectId, ref: 'Bill' },
amount: Number,
provider: String,
success: Boolean,
raw: Object,
createdAt: { type: Date, default: Date.now }
});
module.exports = MT('Transaction', TransactionSchema);