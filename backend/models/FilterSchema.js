const mongoose = require('mongoose');

const filterOptionSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: String, required: true }
});

const filterBlockSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['CHECKBOX', 'RADIO', 'SLIDER'], required: true },
  name: { type: String, required: true }, // Key for the URL parameter (e.g., 'venue_price')
  options: [filterOptionSchema]
});

const filterSchemaMongoose = new mongoose.Schema({
  categoryGroup: { 
    type: String, 
    required: true, 
    unique: true,
    enum: ['VENUE', 'PHOTO', 'MAKEUP', 'CATERING', 'DECOR', 'DJ', 'JEWELRY', 'LOGISTICS', 'GENERAL']
  },
  filters: [filterBlockSchema]
}, { timestamps: true });

module.exports = mongoose.model('FilterSchema', filterSchemaMongoose);
