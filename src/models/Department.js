const { Schema: SB, model: MB } = require('mongoose');
const DepartmentSchema = new SB({
name: { type: String, required: true, unique: true },
description: String,
createdAt: { type: Date, default: Date.now }
});
module.exports = MB('Department', DepartmentSchema);