const express = require('express');
const router = express.Router();
const axios = require('axios');
const StagingLead = require('../models/StagingLead');

// API: Get all staging leads (vendors)
router.get('/', async (req, res) => {
  try {
    const data = await StagingLead.find().sort({ scrapedAt: -1 }).lean();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// API: Update a vendor (verify/edit)
router.put('/:id', async (req, res) => {
  try {
    const updated = await StagingLead.findOneAndUpdate(
      { id: req.params.id }, 
      { ...req.body, verified: true }, 
      { new: true }
    );
    if (updated) res.json({ success: true, vendor: updated });
    else res.status(404).json({ error: 'Vendor not found' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// API: Delete a vendor (reject)
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await StagingLead.findOneAndDelete({ id: req.params.id });
    if (deleted) res.json({ success: true, message: 'Deleted' });
    else res.status(404).json({ error: 'Not found' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// API: Bulk delete unverified vendors
router.post('/clear-unverified', async (req, res) => {
  try {
    await StagingLead.deleteMany({ verified: false });
    res.json({ success: true, message: 'Unverified vendors cleared' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// API: Assign leads to an employee
router.post('/assign', async (req, res) => {
  try {
    const { vendorIds, employeeId } = req.body;
    if (!vendorIds || !employeeId) return res.status(400).json({ error: 'Missing data' });
    
    await StagingLead.updateMany(
      { id: { $in: vendorIds } },
      { $set: { assignedTo: employeeId, assignedAt: new Date() } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Assignment failed' });
  }
});

// API: Update CRM Status (used by employees)
router.put('/:id/crm', async (req, res) => {
  try {
    const { crmStatus, notes } = req.body;
    const updated = await StagingLead.findOneAndUpdate(
      { id: req.params.id },
      { $set: { crmStatus, crmNotes: notes, crmLastUpdated: new Date() } },
      { new: true }
    );
    res.json({ success: true, vendor: updated });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// API: Push Verified Leads to Production (Gomandap main DB)
router.post('/push', async (req, res) => {
  try {
    const verifiedVendors = await StagingLead.find({ verified: true, pushed: false }).lean();
    
    if (verifiedVendors.length === 0) {
      return res.status(400).json({ error: 'No verified unpushed vendors found.' });
    }

    const response = await axios.post('http://localhost:5000/api/leads/bulk', {
      leads: verifiedVendors
    });
    
    if (response.data.success) {
      await StagingLead.updateMany(
        { id: { $in: verifiedVendors.map(v => v.id) } },
        { $set: { pushed: true, pushedAt: new Date() } }
      );
      res.json({ success: true, pushed: verifiedVendors.length, message: response.data.message });
    } else {
      res.status(500).json({ error: 'Failed to push to CRM' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Push failed: ' + error.message });
  }
});

module.exports = router;
