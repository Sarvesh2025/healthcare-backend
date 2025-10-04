const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');


const UserSchema = new Schema({
name: { type: String, required: true },
email: { type: String, required: true, unique: true, lowercase: true },
password: { type: String, required: true },
role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
createdAt: { type: Date, default: Date.now }
});


UserSchema.pre('save', async function(next) {
if (!this.isModified('password')) return next();
const salt = await bcrypt.genSalt(10);
this.password = await bcrypt.hash(this.password, salt);
next();
});


UserSchema.methods.comparePassword = function(password) {
return bcrypt.compare(password, this.password);
}


module.exports = model('User', UserSchema);