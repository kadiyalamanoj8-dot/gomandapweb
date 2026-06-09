require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Vendor = require('../models/Vendor');

const categories = [
  'Banquet Halls',
  'Photography & Videography',
  'Makeup Artists (MUA)',
  'Catering Service',
  'Stage & Venue Decor'
];

const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai'];

// Cloudinary standard dummy images
const dummyImages = [
  'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80',
  'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=800&q=80',
  'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80',
  'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80'
];

const generateVendors = () => {
  const vendors = [];
  categories.forEach((cat, catIndex) => {
    // 5 vendors per category (4 approved, 1 pending)
    for (let i = 1; i <= 5; i++) {
      const isApproved = i <= 4;
      
      vendors.push({
        name: `Premium ${cat.split(' ')[0]} ${i}`,
        email: `vendor${catIndex}_${i}@test.com`,
        category: cat,
        ownerName: `Owner ${i}`,
        contact: { phone: `98765432${catIndex}${i}` },
        address: {
          city: locations[i - 1],
          state: 'State',
          street: `Street ${i}`
        },
        status: isApproved ? 'approved' : 'pending',
        isFeatured: i === 1, // first one is featured
        rating: isApproved ? parseFloat((Math.random() * (5.0 - 4.2) + 4.2).toFixed(1)) : 0, // Ensure numeric rating!
        reviewsCount: isApproved ? Math.floor(Math.random() * 300 + 20) : 0,
        portfolioImages: dummyImages,
        profileImageUrl: dummyImages[0],
        customBlocks: {
          pricingPackages: [
            { title: 'Standard Package', desc: 'Basic services included', price: '₹50,000' },
            { title: 'Premium Package', desc: 'All premium services', price: '₹1,50,000' }
          ]
        },
        deepFeatures: {
          'Experience': '5+ Years',
          'Travels Outstation': 'Yes',
          'Advance Required': '50%'
        }
      });
    }
  });
  return vendors;
};

const seedDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI is undefined. Check .env file path.");
    await mongoose.connect(uri);
    console.log('MongoDB Connected');

    console.log('Clearing existing vendors...');
    await Vendor.deleteMany({});

    console.log('Inserting mock vendors...');
    const vendors = generateVendors();
    await Vendor.insertMany(vendors);

    console.log(`Successfully inserted ${vendors.length} vendors.`);
    process.exit();
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedDB();
