require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Vendor = require('../models/Vendor');

// List of all categories exactly as they appear in the app
const categories = [
  'Banquet Halls', 'Kalyana Mandapams', 'Open Lawns & Farmhouses', 
  'Resorts & Destination Venues', '5-Star Hotels', 'Party & Mini Halls', 'Temples & Ashrams',
  'Photography & Videography', 'Makeup Artists (MUA)', 'Mehndi Designers',
  'Wedding Clothes / Boutiques', 'Jewelry Shops', 'DJs & Sound Systems',
  'Live Musicians / Band Baaja', 'Event Planners', 'Astrologers / Pundits',
  'Cars & Buses (Travel)', 'Honeymoon Packages', 'Catering Service',
  'Stage & Venue Decor', 'Wedding Cards & Invites'
];

// Helper to generate random coordinates near Hyderabad
const getRandomLocation = () => {
  // Hyderabad roughly: Lat 17.3850, Lon 78.4867
  const lat = 17.3850 + (Math.random() - 0.5) * 0.2; // roughly 20km radius
  const lon = 78.4867 + (Math.random() - 0.5) * 0.2;
  return [lon, lat]; // GeoJSON is [longitude, latitude]
};

// Generic image pools
const profileImages = [
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80',
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80',
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
  'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&q=80',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80'
];

const adjectives = ['Royal', 'Grand', 'Premium', 'Elite', 'Classic', 'Luxury', 'Divine', 'Majestic'];
const nouns = ['Elegance', 'Aura', 'Moments', 'Vows', 'Celebrations', 'Dreams', 'Glory'];

const getCategorySpecificData = (category) => {
  let deepFeatures = {};
  let pricingPackages = [];

  const venueCats = ['Banquet Halls', 'Kalyana Mandapams', 'Open Lawns & Farmhouses', 'Resorts & Destination Venues', '5-Star Hotels', 'Party & Mini Halls', 'Temples & Ashrams'];
  
  if (venueCats.includes(category)) {
    deepFeatures = {
      capacity: Math.floor(Math.random() * 800) + 200,
      rooms: Math.floor(Math.random() * 15) + 5,
      parking: Math.floor(Math.random() * 100) + 20,
      ac: 'Fully AC'
    };
    pricingPackages = [
      { title: 'Standard Veg', desc: 'Welcome drink, 3 starters, standard main course.', price: '₹600 / plate' },
      { title: 'Premium Non-Veg', desc: 'Mocktails, 5 starters, premium main course and desserts.', price: '₹1200 / plate' }
    ];
  } else if (category === 'Photography & Videography') {
    deepFeatures = { teamSize: 4, deliveryTime: 30, drone: 'Yes' };
    pricingPackages = [
      { title: 'Photo + Video', price: '₹75,000 / day', desc: 'Full Photography + Cinematic Videography' },
      { title: 'Pre-Wedding', price: '₹25,000 / day', desc: 'Outdoor shoot with Drone & Props' }
    ];
  } else if (category === 'Makeup Artists (MUA)') {
    deepFeatures = { teamSize: 2, travels: 'Yes' };
    pricingPackages = [
      { title: 'Bridal Makeup', price: '₹15,000', desc: 'HD Makeup, Hair Styling, Draping & Lashes' },
      { title: 'Airbrush Upgrade', price: '+ ₹5,000', desc: 'Upgrade to flawless Airbrush technique' }
    ];
  } else if (category === 'Catering Service') {
    deepFeatures = { teamSize: 10, travels: 'Yes' };
    pricingPackages = [
      { title: 'Vegetarian Menu', price: '₹800 / plate', desc: '4 Starters, 4 Mains, 2 Breads, 2 Desserts' },
      { title: 'Non-Veg Menu', price: '₹1,200 / plate', desc: 'Includes Chicken & Mutton delicacies' }
    ];
  } else {
    deepFeatures = { teamSize: 3, travels: 'Yes' };
    pricingPackages = [
      { title: 'Standard Package', price: '₹20,000', desc: 'Basic services as per category standard' },
      { title: 'Premium Package', price: '₹50,000', desc: 'Luxury services with premium deliverables' }
    ];
  }

  return { deepFeatures, pricingPackages };
};

const seedVendors = async () => {
  try {
    // 1. Connect to DB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gomandap'; // Fallback if no .env
    console.log('Connecting to MongoDB:', mongoUri.split('@').pop()); // Log safely
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully.');

    // 2. Clear old mock vendors (to prevent duplicates if run multiple times)
    const deleteRes = await Vendor.deleteMany({ name: { $regex: /\(Mock Vendor\)$/ } });
    console.log(`Cleared ${deleteRes.deletedCount} old mock vendors.`);

    // 3. Generate Mock Vendors
    const newVendors = [];
    let counter = 1;

    for (const category of categories) {
      // Create 5 vendors per category
      for (let i = 1; i <= 5; i++) {
        // First 4 are approved, the 5th is pending
        const status = i <= 4 ? 'approved' : 'pending';
        
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        const name = `${adj} ${noun} ${category.split(' ')[0]} (Mock Vendor)`;
        
        const { deepFeatures, pricingPackages } = getCategorySpecificData(category);
        const [lon, lat] = getRandomLocation();
        
        const vendor = {
          name: name,
          email: `mockvendor${counter}@example.com`,
          category: category,
          ownerName: `Mock Owner ${counter}`,
          contact: {
            phone: `987654${Math.floor(1000 + Math.random() * 9000)}`,
            whatsapp: `987654${Math.floor(1000 + Math.random() * 9000)}`,
            email: `mockvendor${counter}@example.com`
          },
          address: {
            street: `Plot ${counter}, Mock Street`,
            village: 'Mock Village',
            mandal: 'Mock Mandal',
            district: 'Hyderabad',
            state: 'Telangana',
            city: 'Hyderabad',
            pincode: '500001'
          },
          locationData: {
            type: 'Point',
            coordinates: [lon, lat],
            googleMapsLink: 'https://maps.google.com',
            isLocationLocked: true,
            parsedAddress: {
              village: 'Mock Village',
              mandal: 'Mock Mandal',
              district: 'Hyderabad',
              state: 'Telangana'
            }
          },
          gstin: `22AAAAA0000A1Z${i}`,
          experience: `${Math.floor(Math.random() * 10) + 1} Years`,
          status: status,
          currentStep: status === 'approved' ? 5 : 3, // Complete onboarding for approved
          isFeatured: i === 1, // Make the first one featured
          rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0
          reviewsCount: Math.floor(Math.random() * 50) + 5,
          deepFeatures: deepFeatures,
          customBlocks: {
            pricingPackages: pricingPackages
          },
          banking: {
            accountName: `Mock Owner ${counter}`,
            bankName: 'Mock Bank of India',
            accountNumber: '123456789012',
            ifscCode: 'MOCK0001234',
            upiId: `mock${counter}@upi`
          },
          portfolioImages: [
            profileImages[Math.floor(Math.random() * profileImages.length)],
            profileImages[Math.floor(Math.random() * profileImages.length)]
          ],
          profileImageUrl: profileImages[Math.floor(Math.random() * profileImages.length)]
        };

        newVendors.push(vendor);
        counter++;
      }
    }

    // 4. Insert into DB
    console.log(`Inserting ${newVendors.length} mock vendors...`);
    await Vendor.insertMany(newVendors);
    console.log('Successfully inserted mock vendors!');

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding mock vendors:', error);
    process.exit(1);
  }
};

seedVendors();
