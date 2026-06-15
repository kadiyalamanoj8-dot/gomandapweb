const CartOrder = require('../models/CartOrder');
const Vendor = require('../models/Vendor');

// 1. Client submits a new Cart Order
exports.createCartOrder = async (req, res) => {
  try {
    const { clientName, clientPhone, clientEmail, eventType, items, clientNotes } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Calculate total
    const totalAmount = items.reduce((sum, item) => sum + (Number(item.quotedPrice) || 0), 0);

    const order = await CartOrder.create({
      clientName,
      clientPhone,
      clientEmail,
      eventType,
      items,
      clientNotes,
      totalAmount
    });

    res.status(201).json({ message: 'Booking request submitted successfully', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Vendor fetches their specific booking requests
exports.getVendorBookings = async (req, res) => {
  try {
    const { vendorId } = req.params;
    
    // Find all cart orders that contain this vendorId
    const orders = await CartOrder.find({ 'items.vendorId': vendorId }).sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Vendor accepts/rejects their part of the booking
exports.updateVendorItemStatus = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { status, vendorNotes } = req.body; // 'Accepted' or 'Rejected'

    const order = await CartOrder.findOneAndUpdate(
      { _id: orderId, 'items._id': itemId },
      { 
        $set: { 
          'items.$.status': status,
          'items.$.vendorNotes': vendorNotes 
        } 
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: 'Order or Item not found' });
    }

    res.json({ message: `Booking status updated to ${status}`, order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
