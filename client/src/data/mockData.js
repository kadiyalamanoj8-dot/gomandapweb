// The 7 core Indian cultural event types
export const EVENT_TYPES = [
  'Pelli / Shaadi (The Grand Wedding)',
  'Engagement / Nishchithartham',
  'Sangeet & Mehendi Night',
  'Reception',
  'Half-Saree / Dhoti Functions',
  'Cradle Ceremony / Barasala',
  'Birthday Parties & Anniversaries'
];

// 5 Everyday Cultural Buckets containing the expanded categories
export const CATEGORY_BUCKETS = [
  {
    id: 'function-places',
    label: '🏛️ Function Places',
    subtitle: 'Find the perfect venue for your grand celebration.',
    categories: [
      { id: 'banquet-halls', label: 'Banquet Halls', iconName: 'Hotel' },
      { id: 'kalyana-mandapams', label: 'Kalyana Mandapams', iconName: 'Landmark' },
      { id: 'open-lawns', label: 'Open Lawns & Farmhouses', iconName: 'TreePine' },
      { id: 'resorts', label: 'Resorts & Destination Venues', iconName: 'Palmtree' },
      { id: '5-star-hotels', label: '5-Star Hotels', iconName: 'Crown' },
      { id: 'party-halls', label: 'Party & Mini Halls', iconName: 'PartyPopper' },
      { id: 'temples', label: 'Temples & Ashrams', iconName: 'Flame' }
    ]
  },
  {
    id: 'food-decor',
    label: '🍲 Food & Decoration',
    subtitle: 'Core essentials to make your event unforgettable.',
    categories: [
      { id: 'catering', label: 'Catering Service', iconName: 'UtensilsCrossed' },
      { id: 'decor', label: 'Stage & Venue Decor', iconName: 'Sparkles' },
      { id: 'planners', label: 'Event Planners', iconName: 'CalendarCheck' }
    ]
  },
  {
    id: 'photos-music',
    label: '📸 Photos & Music',
    subtitle: 'Capture the memories and keep the party alive.',
    categories: [
      { id: 'photography', label: 'Photography & Videography', iconName: 'Camera' },
      { id: 'djs', label: 'DJs & Sound Systems', iconName: 'Music' },
      { id: 'live-musicians', label: 'Live Musicians / Band Baaja', iconName: 'Mic2' }
    ]
  },
  {
    id: 'styling',
    label: '💅 Bridal & Groom Styling',
    subtitle: 'Look and feel your absolute best.',
    categories: [
      { id: 'makeup-artists', label: 'Makeup Artists (MUA)', iconName: 'Brush' },
      { id: 'mehndi-specialists', label: 'Mehndi Designers', iconName: 'Flower2' },
      { id: 'wedding-wear', label: 'Wedding Clothes / Boutiques', iconName: 'Shirt' },
      { id: 'jewelry-providers', label: 'Jewelry Shops', iconName: 'Gem' }
    ]
  },
  {
    id: 'logistics',
    label: '🚗 Invites & Travel',
    subtitle: 'From the first invitation to the honeymoon getaway.',
    categories: [
      { id: 'invitation-designers', label: 'Wedding Cards & Invites', iconName: 'MailOpen' },
      { id: 'transportation', label: 'Cars & Buses (Travel)', iconName: 'Car' },
      { id: 'astrologers', label: 'Astrologers / Pundits', iconName: 'MoonStar' },
      { id: 'honeymoon-travel', label: 'Honeymoon Packages', iconName: 'Plane' }
    ]
  }
];

// Flat list for the slider and generators
export const CATEGORIES = CATEGORY_BUCKETS.flatMap(bucket => bucket.categories);

// Export split lists for visual UI selection
export const VENUE_CATEGORIES = CATEGORY_BUCKETS[0].categories;
export const VENDOR_CATEGORIES = CATEGORY_BUCKETS.slice(1).flatMap(bucket => bucket.categories);

// Mock data for Detailed Featured Vendors
export const FEATURED_VENDORS = [
  {
    id: 'v1',
    name: 'The Grand Lotus Palace',
    category: 'Banquet Halls',
    pricePerPlate: '₹1,500',
    rating: 4.8,
    reviewsCount: 342,
    location: 'South Delhi, Delhi',
    imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    featured: true
  },
  {
    id: 'v2',
    name: 'Royal Heritage Lawns',
    category: 'Open Lawns',
    pricePerPlate: '₹2,200',
    rating: 4.9,
    reviewsCount: 128,
    location: 'Bandra West, Mumbai',
    imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    featured: true
  },
  {
    id: 'v3',
    name: 'Capture Infinity Photography',
    category: 'Photography',
    pricePerPlate: '₹80,000 / day',
    rating: 4.7,
    reviewsCount: 56,
    location: 'Koramangala, Bangalore',
    imageUrl: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    featured: false
  },
  {
    id: 'v4',
    name: 'Golden Spices Caterers',
    category: 'Catering',
    pricePerPlate: '₹1,200',
    rating: 4.6,
    reviewsCount: 210,
    location: 'Jubilee Hills, Hyderabad',
    imageUrl: 'https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    featured: true
  },
  {
    id: 'v5',
    name: 'Aura Decor Elements',
    category: 'Decor',
    pricePerPlate: '₹1,50,000',
    rating: 4.9,
    reviewsCount: 89,
    location: 'Anna Nagar, Chennai',
    imageUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    featured: false
  },
  {
    id: 'v6',
    name: 'Taj Exotica Resort & Spa',
    category: 'Resorts',
    pricePerPlate: '₹3,500',
    rating: 5.0,
    reviewsCount: 845,
    location: 'South Goa, Goa',
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    featured: true
  }
];

const categoryMockConfig = {
  'Banquet Halls': {
    names: ['The Grand Lotus', 'Royal Palace', 'Crystal Ballroom', 'Imperial Hall', 'Majestic Banquets'],
    images: ['1519167758481-83f550bb49b3', '1469334031218-e382a71b716b'],
    minPrice: 1000, maxPrice: 3500
  },
  'Kalyana Mandapams': {
    names: ['Sri Venkateshwara Mandapam', 'Padmavati Kalyana Mandapam', 'Shubh Aarambh Halls'],
    images: ['1519225421980-a95ce669bfaa', '1511285560929-80b456fea0a1'],
    minPrice: 500, maxPrice: 1500
  },
  'Open Lawns & Farmhouses': {
    names: ['Green Acres', 'Whispering Willows Lawn', 'Sunset Farmhouse', 'Royal Lawns'],
    images: ['1519167758481-83f550bb49b3', '1537151608828-ea2b11777ee8'],
    minPrice: 1200, maxPrice: 4000
  },
  'Resorts & Destination Venues': {
    names: ['Taj Exotica Resort', 'The Oberoi Villas', 'Leela Palace Destination', 'Ananta Resorts'],
    images: ['1582719478250-c89cae4dc85b', '1566073771259-6a85e60cb386'],
    minPrice: 4000, maxPrice: 12000
  },
  '5-Star Hotels': {
    names: ['ITC Grand', 'The Ritz-Carlton', 'JW Marriott', 'Hyatt Regency'],
    images: ['1542314831-24fe56d81b83', '1551882547-ff40c65fe5fa'],
    minPrice: 3500, maxPrice: 8000
  },
  'Party & Mini Halls': {
    names: ['Silver Spoon Hall', 'Celebration Mini Hall', 'The Joy Room', 'Gathering Space'],
    images: ['1511285560929-80b456fea0a1', '1492684223066-81342ee5ff30'],
    minPrice: 400, maxPrice: 1000
  },
  'Temples & Ashrams': {
    names: ['Iskcon Temple Grounds', 'Sri Krishna Ashram', 'Devi Temple Hall'],
    images: ['1603513364402-9a572a1f26a1', '1582424883492-9a7ed18b62c1'],
    minPrice: 200, maxPrice: 600
  },
  'Photography & Videography': {
    names: ['Capture Infinity', 'Candid Tales Studio', 'Wedding Storytellers', 'Lens & Light', 'The Cinematic Frame'],
    images: ['1537151608828-ea2b11777ee8', '1516035069371-29a1b244cc32', '1551316666-41fa9b25126f'],
    minPrice: 40000, maxPrice: 250000
  },
  'Catering Service': {
    names: ['Golden Spices', 'Royal Feasts', 'Divine Flavors Caterers', 'The Grand Kitchen'],
    images: ['1555244162-803834f70033', '1553621042-f6e147245754', '1548946526-f692e7e34c52'],
    minPrice: 800, maxPrice: 3500
  },
  'Stage & Venue Decor': {
    names: ['Aura Decor', 'Petal & Props', 'Dream Elements Decorators', 'Royal Mandap Setup'],
    images: ['1464366400600-7168b8af9bc3', '1511795409476-69222e4d06a8', '1505236858219-8359eb29e329'],
    minPrice: 50000, maxPrice: 500000
  },
  'Event Planners': {
    names: ['Perfect Weddings Co.', 'Vows & Tales', 'The Grand Curators', 'Elite Event Managers'],
    images: ['1511795409476-69222e4d06a8', '1519225421980-a95ce669bfaa'],
    minPrice: 80000, maxPrice: 400000
  },
  'DJs & Sound Systems': {
    names: ['DJ Spinzz', 'Beat Drop Audio', 'Nightrider Sounds', 'Bass King DJ'],
    images: ['1516450360452-9312f5e86fc7', '1514525253161-7a46d19cd819', '1598387122177-33a39e8800b4'],
    minPrice: 15000, maxPrice: 60000
  },
  'Live Musicians / Band Baaja': {
    names: ['The Royal Band', 'Symphony Strings', 'Traditional Nadaswaram Group', 'Rhythm Brass Band'],
    images: ['1511192336575-5a79af67a629', '1520625624503-4f997c6ce5d7'],
    minPrice: 20000, maxPrice: 80000
  },
  'Makeup Artists (MUA)': {
    names: ['Glamour Look by Priya', 'Bridal Radiance', 'Flawless Strokes', 'Glow & Tell MUA'],
    images: ['1487412720507-e7ab37603c6f', '1596704017254-9bd12364e6e2', '1522337660859-02fbefca4702'],
    minPrice: 15000, maxPrice: 45000
  },
  'Mehndi Designers': {
    names: ['Heena Arts', 'Bridal Mehndi by Sana', 'Intricate Patterns Design', 'Royal Henna'],
    images: ['1594950293078-1a5789f66bb6', '1610444315264-7933182b6b14'],
    minPrice: 3000, maxPrice: 15000
  },
  'Wedding Clothes / Boutiques': {
    names: ['Bridal Threads', 'The Sherwani Lounge', 'Pattu Silks Collection', 'Regal Boutique'],
    images: ['1595777457583-95e059f58196', '1550614000-4b95d4ed79d1'],
    minPrice: 15000, maxPrice: 150000
  },
  'Jewelry Shops': {
    names: ['Gold & Diamond House', 'Antique Jewellers', 'Bridal Sparkle Rentals', 'Kundan Experts'],
    images: ['1515562141207-8e8cf4cb3ba7', '1599643478524-cece13540455'],
    minPrice: 25000, maxPrice: 500000
  },
  'Wedding Cards & Invites': {
    names: ['Elegant Invites', 'Digital Canvas Cards', 'The Boxed Invitation', 'Traditional Prints'],
    images: ['1525049539343-b26e031a0e88', '1605332766324-eeaf185ef343'],
    minPrice: 50, maxPrice: 500
  },
  'Cars & Buses (Travel)': {
    names: ['Royal Rides Luxury', 'Vintage Wheels Rental', 'Guest Travels AC Buses', 'Bridal Fleet Services'],
    images: ['1503343586029-7c85859e99a4', '1559868945-866ce005d45d', '1511910849309-0d12e6208bf5'],
    minPrice: 8000, maxPrice: 35000
  },
  'Astrologers / Pundits': {
    names: ['Vedic Pundit Services', 'Sri Sai Astrologer', 'Muhurtham Experts', 'Online Kundali Check'],
    images: ['1554118811-1e0d58224f24', '1606293926075-69a00b0f4cb6'],
    minPrice: 2000, maxPrice: 11000
  },
  'Honeymoon Packages': {
    names: ['Tropical Escapes Travels', 'Swiss Dreams Agency', 'Romantic Getaways', 'Maldives Specials'],
    images: ['1499793983690-e29da59ef1c2', '1519046904884-53103b184066', '1506197603052-3cc9c3a201bd'],
    minPrice: 60000, maxPrice: 350000
  }
};

export const generateFakeVendors = (categoryLabel, count = 8) => {
  const config = categoryMockConfig[categoryLabel] || {
    names: ['Premium Vendor A', 'Premium Vendor B', 'Luxury Services'],
    images: ['1519167758481-83f550bb49b3'],
    minPrice: 5000, maxPrice: 20000
  };

  return Array.from({ length: count }).map((_, index) => {
    // Generate mathematically realistic data
    const randomName = config.names[index % config.names.length] + (index >= config.names.length ? ` ${index + 1}` : '');
    const priceRaw = Math.floor(Math.random() * (config.maxPrice - config.minPrice) + config.minPrice);
    
    // Round to nearest 100 for cleaner numbers
    const roundedPrice = Math.round(priceRaw / 100) * 100;
    const formattedPrice = `₹${roundedPrice.toLocaleString('en-IN')}`;

    return {
      id: `${categoryLabel.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${index}`,
      name: randomName,
      category: categoryLabel,
      pricePerPlate: formattedPrice,
      rating: (Math.random() * (5.0 - 4.2) + 4.2).toFixed(1), // Ratings between 4.2 and 5.0
      reviewsCount: Math.floor(Math.random() * 450 + 20),
      location: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune'][Math.floor(Math.random() * 6)],
      imageUrl: `https://images.unsplash.com/photo-${config.images[index % config.images.length]}?w=800&q=80`,
      featured: index < 2
    };
  });
};
