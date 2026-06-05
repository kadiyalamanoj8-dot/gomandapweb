require('dotenv').config();
const mongoose = require('mongoose');
const FilterSchema = require('./models/FilterSchema');

const seedData = [
  {
    categoryGroup: 'VENUE',
    filters: [
      {
        title: 'Guest Capacity',
        type: 'CHECKBOX',
        name: 'venue_capacity',
        options: [
          { label: 'Less than 100', value: '<100' },
          { label: '100 to 250', value: '100-250' },
          { label: '250 to 500', value: '250-500' },
          { label: '500 to 1000', value: '500-1000' },
          { label: '1000 and above', value: '>1000' }
        ]
      },
      {
        title: 'Price Range (Per Plate/Rental)',
        type: 'RADIO',
        name: 'venue_price',
        options: [
          { label: 'Any Budget', value: 'any' },
          { label: '₹500 - ₹1,000', value: '500-1000' },
          { label: '₹1,000 - ₹2,000', value: '1000-2000' },
          { label: '₹2,000 - ₹3,000', value: '2000-3000' },
          { label: '₹3,000 +', value: '>3000' }
        ]
      },
      {
        title: 'Amenities & Rules',
        type: 'CHECKBOX',
        name: 'venue_amenities',
        options: [
          { label: 'Air Conditioned', value: 'ac' },
          { label: 'Rooms Available', value: 'rooms' },
          { label: 'In-house Catering Only', value: 'in_house_catering_only' },
          { label: 'Outside Decorators Allowed', value: 'outside_decorators' },
          { label: 'Liquor Allowed', value: 'liquor' },
          { label: 'Valet Parking', value: 'valet' }
        ]
      },
      {
        title: 'Setting Type',
        type: 'CHECKBOX',
        name: 'venue_setting',
        options: [
          { label: 'Indoor Banquet', value: 'indoor' },
          { label: 'Outdoor Lawn', value: 'outdoor' },
          { label: 'Poolside', value: 'poolside' }
        ]
      }
    ]
  },
  {
    categoryGroup: 'PHOTO',
    filters: [
      {
        title: 'Services Offered',
        type: 'CHECKBOX',
        name: 'photo_services',
        options: [
          { label: 'Traditional Photography', value: 'traditional_photo' },
          { label: 'Candid Photography', value: 'candid_photo' },
          { label: 'Cinematic Videography', value: 'cinematic_video' },
          { label: 'Pre-wedding Shoot', value: 'pre_wedding' },
          { label: 'Drone Shoot', value: 'drone' }
        ]
      },
      {
        title: 'Price Range (Per Day)',
        type: 'RADIO',
        name: 'photo_price',
        options: [
          { label: 'Any Budget', value: 'any' },
          { label: 'Under ₹50,000', value: '<50000' },
          { label: '₹50,000 - ₹1 Lakh', value: '50000-100000' },
          { label: '₹1 Lakh - ₹2 Lakhs', value: '100000-200000' },
          { label: '₹2 Lakhs +', value: '>200000' }
        ]
      },
      {
        title: 'Features',
        type: 'CHECKBOX',
        name: 'photo_features',
        options: [
          { label: 'Photo Album Included', value: 'album' },
          { label: 'Same Day Edit', value: 'same_day_edit' }
        ]
      }
    ]
  },
  {
    categoryGroup: 'MAKEUP',
    filters: [
      {
        title: 'Makeup Type',
        type: 'CHECKBOX',
        name: 'makeup_type',
        options: [
          { label: 'HD Makeup', value: 'hd' },
          { label: 'Airbrush Makeup', value: 'airbrush' },
          { label: 'Traditional', value: 'traditional' },
          { label: 'Party Makeup', value: 'party' }
        ]
      },
      {
        title: 'Price Range (Per Event)',
        type: 'RADIO',
        name: 'makeup_price',
        options: [
          { label: 'Any Budget', value: 'any' },
          { label: 'Under ₹10,000', value: '<10000' },
          { label: '₹10,000 - ₹25,000', value: '10000-25000' },
          { label: '₹25,000 +', value: '>25000' }
        ]
      },
      {
        title: 'Services Included',
        type: 'CHECKBOX',
        name: 'makeup_services',
        options: [
          { label: 'Travels to Venue', value: 'travel' },
          { label: 'Trial Available', value: 'trial' },
          { label: 'Hair Styling Included', value: 'hair' },
          { label: 'Draping Included', value: 'draping' }
        ]
      }
    ]
  },
  {
    categoryGroup: 'CATERING',
    filters: [
      {
        title: 'Cuisine Types',
        type: 'CHECKBOX',
        name: 'catering_cuisine',
        options: [
          { label: 'Pure Veg Only', value: 'pure_veg' },
          { label: 'South Indian', value: 'south_indian' },
          { label: 'North Indian', value: 'north_indian' },
          { label: 'Continental', value: 'continental' },
          { label: 'Multi-Cuisine', value: 'multi_cuisine' }
        ]
      },
      {
        title: 'Price (Per Plate)',
        type: 'RADIO',
        name: 'catering_price',
        options: [
          { label: 'Any Budget', value: 'any' },
          { label: 'Under ₹500', value: '<500' },
          { label: '₹500 - ₹1,000', value: '500-1000' },
          { label: '₹1,000 +', value: '>1000' }
        ]
      },
      {
        title: 'Special Features',
        type: 'CHECKBOX',
        name: 'catering_features',
        options: [
          { label: 'Live Counters', value: 'live_counters' },
          { label: 'Dessert Stations', value: 'desserts' },
          { label: 'Welcome Drinks', value: 'drinks' }
        ]
      }
    ]
  },
  {
    categoryGroup: 'DECOR',
    filters: [
      {
        title: 'Core Services',
        type: 'CHECKBOX',
        name: 'decor_services',
        options: [
          { label: 'Floral Decor', value: 'floral' },
          { label: 'Mandap Setup', value: 'mandap' },
          { label: 'Lighting & Sound', value: 'lighting' },
          { label: 'Stage Backdrop', value: 'backdrop' }
        ]
      },
      {
        title: 'Style / Theme',
        type: 'CHECKBOX',
        name: 'decor_style',
        options: [
          { label: 'Traditional', value: 'traditional' },
          { label: 'Modern', value: 'modern' },
          { label: 'Minimalist', value: 'minimalist' },
          { label: 'Royal Heritage', value: 'royal' }
        ]
      },
      {
        title: 'Budget Range',
        type: 'RADIO',
        name: 'decor_budget',
        options: [
          { label: 'Any Budget', value: 'any' },
          { label: 'Under ₹1 Lakh', value: '<100000' },
          { label: '₹1 Lakh - ₹3 Lakhs', value: '100000-300000' },
          { label: '₹3 Lakhs +', value: '>300000' }
        ]
      }
    ]
  },
  {
    categoryGroup: 'DJ',
    filters: [
      {
        title: 'Music Genres',
        type: 'CHECKBOX',
        name: 'dj_genres',
        options: [
          { label: 'Bollywood', value: 'bollywood' },
          { label: 'EDM / House', value: 'edm' },
          { label: 'Regional / Folk', value: 'regional' },
          { label: 'Classical / Instrumental', value: 'classical' }
        ]
      },
      {
        title: 'Setup Included',
        type: 'CHECKBOX',
        name: 'dj_setup',
        options: [
          { label: 'Sound System', value: 'sound_system' },
          { label: 'LED Screens', value: 'led_screens' },
          { label: 'Dance Floor Lighting', value: 'lighting' },
          { label: 'Smoke Machine', value: 'smoke' }
        ]
      },
      {
        title: 'Price Range',
        type: 'RADIO',
        name: 'dj_price',
        options: [
          { label: 'Any Budget', value: 'any' },
          { label: 'Under ₹20,000', value: '<20000' },
          { label: '₹20,000 - ₹50,000', value: '20000-50000' },
          { label: '₹50,000 +', value: '>50000' }
        ]
      }
    ]
  },
  {
    categoryGroup: 'JEWELRY',
    filters: [
      {
        title: 'Purchase Type',
        type: 'CHECKBOX',
        name: 'jewelry_type',
        options: [
          { label: 'Buy', value: 'buy' },
          { label: 'Rent', value: 'rent' }
        ]
      },
      {
        title: 'Style',
        type: 'CHECKBOX',
        name: 'jewelry_style',
        options: [
          { label: 'Antique / Temple', value: 'antique' },
          { label: 'Modern Contemporary', value: 'modern' },
          { label: 'Kundan / Polki', value: 'kundan' },
          { label: 'Diamond', value: 'diamond' }
        ]
      },
      {
        title: 'Price Range',
        type: 'RADIO',
        name: 'jewelry_price',
        options: [
          { label: 'Any Budget', value: 'any' },
          { label: 'Under ₹50,000', value: '<50000' },
          { label: '₹50,000 - ₹1 Lakh', value: '50000-100000' },
          { label: '₹1 Lakh +', value: '>100000' }
        ]
      }
    ]
  },
  {
    categoryGroup: 'LOGISTICS',
    filters: [
      {
        title: 'Service Category',
        type: 'CHECKBOX',
        name: 'logistics_category',
        options: [
          { label: 'Luxury Cars', value: 'luxury_cars' },
          { label: 'Vintage Cars', value: 'vintage_cars' },
          { label: 'AC Buses', value: 'ac_buses' },
          { label: 'Digital Invites', value: 'digital_invites' },
          { label: 'Printed Box Invites', value: 'printed_invites' }
        ]
      },
      {
        title: 'Features',
        type: 'CHECKBOX',
        name: 'logistics_features',
        options: [
          { label: 'Driver Included', value: 'driver' },
          { label: 'Floral Decoration on Car', value: 'floral_car' },
          { label: 'Custom Animations (Invites)', value: 'animations' }
        ]
      },
      {
        title: 'Price Range',
        type: 'RADIO',
        name: 'logistics_price',
        options: [
          { label: 'Any Budget', value: 'any' },
          { label: 'Under ₹10,000', value: '<10000' },
          { label: '₹10,000 - ₹30,000', value: '10000-30000' },
          { label: '₹30,000 +', value: '>30000' }
        ]
      }
    ]
  }
];

const runSeeder = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gomandap');
    console.log('Connected to DB');

    await FilterSchema.deleteMany(); // Clear old filters
    console.log('Cleared existing filters');

    await FilterSchema.insertMany(seedData);
    console.log('Successfully seeded dynamic filters into MongoDB!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

runSeeder();
