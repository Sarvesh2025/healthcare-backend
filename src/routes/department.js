const expressAdm = require('express');
const routerDept = expressAdm.Router();
const { auth: admAuth, authorize: admAuthorize } = require('../middlewares/auth');
const Department = require('../models/Department');


routerDept.get('/', async (req, res) => {
    try {
        const depts = await Department.find();
        res.json(depts);
    } catch (err) { res.status(500).json({ message: err.message }); }   
});
routerDept.post('/create-department', admAuth, admAuthorize('admin'), async (req, res) => {
    const { name, description } = req.body;
    try {
        let existing = await Department.findOne({ name });
        if (existing) return res.status(400).json({ message: 'Department exists' });
        const dept = await Department.create({ name, description });
        res.json(dept);
    } catch (err) { res.status(500).json({ message: err.message }); }
});
routerDept.delete('/delete-department/:id', admAuth, admAuthorize('admin'), async (req, res) => {
    try {
        await Department.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

routerDept.put('/update-department/:id', admAuth, admAuthorize('admin'), async (req, res) => {
    try {
        const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(dept);
    }  
    catch (err) { res.status(500).json({ message: err.message }); } 
});

module.exports = routerDept;