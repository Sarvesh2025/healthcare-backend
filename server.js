const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');


dotenv.config();


const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));


// Routes
const authRoutes = require('./src/routes/auth');
const patientRoutes = require('./src/routes/patient');
const doctorRoutes = require('./src/routes/doctor');
const adminRoutes = require('./src/routes/admin');
const billingRoutes = require('./src/routes/billing');
const departmentRoutes = require('./src/routes/department');


app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/departments', require('./src/routes/department'));


app.get('/', (req, res) => res.send({ ok: true, message: 'Medical backend running' }));


const PORT = process.env.PORT || 4000;


mongoose.connect(process.env.MONGO_URI, {
useNewUrlParser: true,
useUnifiedTopology: true,
}).then(() => {

console.log('Mongo connected' );
app.listen(PORT, () => console.log('Server running on', PORT));
}).catch(err => {
console.error('Mongo connection error', err.message);
});