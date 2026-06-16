const HelpRequest = require('../models/HelpRequest');

// Create a new help request
const createHelpRequest = async (req, res) => {
  try {
    const newRequest = new HelpRequest(req.body);
    await newRequest.save();

    res.status(201).json({
      success: true,
      message: 'Help request submitted successfully. Our experts will contact you soon.',
      data: newRequest
    });
  } catch (error) {
    console.error('Error creating help request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit help request.',
      error: error.message
    });
  }
};

// Get all help requests (for admin panel)
const getHelpRequests = async (req, res) => {
  try {
    const requests = await HelpRequest.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching help requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch help requests.',
      error: error.message
    });
  }
};

// Update status of a help request
const updateHelpRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const request = await HelpRequest.findByIdAndUpdate(
      id, 
      { status }, 
      { new: true }
    );
    
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    console.error('Error updating help request:', error);
    res.status(500).json({ success: false, message: 'Failed to update help request.' });
  }
};

module.exports = {
  createHelpRequest,
  getHelpRequests,
  updateHelpRequestStatus
};
