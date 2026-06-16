export const getCategorySchema = (category) => {
  // 1. Venues Group
  const venueCategories = [
    'Banquet Halls', 'Kalyana Mandapams', 'Open Lawns & Farmhouses', 
    'Resorts & Destination Venues', '5-Star Hotels', 'Party & Mini Halls', 'Temples & Ashrams'
  ];
  if (venueCategories.includes(category)) {
    return {
      aboutTitle: 'About this Venue',
      featuresTitle: 'Venue Amenities',
      pricingUnit: '/ plate',
      featuresList: [
        'Air Conditioned Halls', 'Ample Valet Parking', 'Bridal Dressing Room',
        'In-house Catering', 'Outside Decorators Allowed', 'Liquor License Available',
        'Power Backup', 'Wheelchair Accessible', 'DJ Services Available'
      ],
      bookingFields: [
        { id: 'date', label: 'Event Date', type: 'date', icon: 'Calendar' },
        { id: 'guests', label: 'Guest Count', type: 'select', icon: 'Users', options: ['100 - 300 Guests', '300 - 500 Guests', '500 - 1000 Guests', '1000+ Guests'] },
        { id: 'eventType', label: 'Event Time', type: 'select', icon: 'Clock', options: ['Morning (Lunch)', 'Evening (Dinner)', 'Full Day'] }
      ],
      vendorFormFields: [
        { id: 'capacity', label: 'Max Guest Capacity', type: 'number', placeholder: 'e.g. 500' },
        { id: 'rooms', label: 'Number of Rooms', type: 'number', placeholder: 'e.g. 10' },
        { id: 'parking', label: 'Parking Capacity (Cars)', type: 'number', placeholder: 'e.g. 50' },
        { id: 'ac', label: 'Air Conditioning', type: 'select', options: ['Fully AC', 'Non-AC', 'Partial AC'] },
        { id: 'vegPlatePrice', label: 'Veg Plate Price (₹)', type: 'number', placeholder: 'e.g. 800' },
        { id: 'nonVegPlatePrice', label: 'Non-Veg Plate Price (₹)', type: 'number', placeholder: 'e.g. 1200' },
        { id: 'rentalPrice', label: 'Standard Venue Rental Price (₹)', type: 'number', placeholder: 'e.g. 150000' },
        { id: 'inHouseCatering', label: 'Catering Policy', type: 'select', options: ['In-house Only', 'Outside Allowed', 'Both Available'] },
        { id: 'inHousePhotography', label: 'Photography Policy', type: 'select', options: ['In-house Only', 'Outside Allowed', 'Both Available'] },
        { id: 'inHouseDecorations', label: 'Decor Policy', type: 'select', options: ['In-house Only', 'Outside Allowed', 'Both Available'] },
        { id: 'alcoholPolicy', label: 'Alcohol Policy', type: 'select', options: ['Not Allowed', 'Allowed (With License)', 'Allowed (In-house provided)'] },
        { id: 'djPolicy', label: 'DJ Policy', type: 'select', options: ['In-house Only', 'Outside DJ Allowed', 'Late-night Allowed'] }
      ]
    };
  }

  // 2. Photography & Videography
  if (category === 'Photography & Videography') {
    return {
      aboutTitle: 'About the Studio',
      featuresTitle: 'Service Features',
      pricingUnit: '/ day',
      featuresList: [
        'High Resolution Deliverables', 'Candid Photography', 'Traditional Videography',
        'Drone Shoots', 'Same Day Edit', 'Pre-Wedding Shoots'
      ],
      customBlocks: {
        pricingPackages: [
          { title: 'Photo Only', price: '₹40,000 / day', desc: 'Candid & Traditional Photography with Album' },
          { title: 'Photo + Video', price: '₹75,000 / day', desc: 'Full Photography + Cinematic Videography' },
          { title: 'Pre-Wedding', price: '₹25,000 / day', desc: 'Outdoor shoot with Drone & Props' }
        ],
        policies: [
          { label: 'Advance Payment', value: '50% at booking' },
          { label: 'Delivery Time', value: '1 Month' },
          { label: 'Travel Charges', value: 'Outstation travel & stay paid by client' }
        ]
      },
      bookingFields: [
        { id: 'date', label: 'Event Date', type: 'date', icon: 'Calendar' },
        { id: 'days', label: 'Number of Days', type: 'select', icon: 'Clock', options: ['1 Day Event', '2 Days Event', '3 Days Event', '4+ Days'] },
        { id: 'package', label: 'Select Package', type: 'select', icon: 'Briefcase', options: ['Basic (Photo Only)', 'Premium (Photo + Video)', 'Luxury (Cinematic + Drone)'] }
      ],
      vendorFormFields: [
        { id: 'teamSize', label: 'Team Size', type: 'number', placeholder: 'e.g. 4' },
        { id: 'deliveryTime', label: 'Average Delivery Time (Days)', type: 'number', placeholder: 'e.g. 30' },
        { id: 'drone', label: 'Drone Available?', type: 'select', options: ['Yes', 'No'] }
      ]
    };
  }

  // 3. Makeup Artists (MUA)
  if (category === 'Makeup Artists (MUA)') {
    return {
      aboutTitle: 'About the Artist',
      featuresTitle: 'Makeup Expertise',
      pricingUnit: '/ session',
      featuresList: [
        'HD Makeup', 'Airbrush Makeup', 'Hair Styling Included',
        'Draping Included', 'Travels to Venue', 'Paid Trial Available'
      ],
      customBlocks: {
        pricingPackages: [
          { title: 'Bridal Makeup', price: '₹15,000', desc: 'HD Makeup, Hair Styling, Draping & Lashes' },
          { title: 'Party Makeup', price: '₹5,000', desc: 'For family members and bridesmaids' },
          { title: 'Airbrush Upgrade', price: '+ ₹5,000', desc: 'Upgrade to flawless Airbrush technique' }
        ],
        policies: [
          { label: 'Travels to Venue', value: 'Yes' },
          { label: 'Trial Makeup', value: 'Available (Paid)' }
        ]
      },
      bookingFields: [
        { id: 'date', label: 'Event Date', type: 'date', icon: 'Calendar' },
        { id: 'serviceType', label: 'Service Type', type: 'select', icon: 'Sparkles', options: ['Bridal Makeup', 'Party/Guest Makeup', 'Pre-Wedding Shoot'] },
        { id: 'makeupTech', label: 'Technique', type: 'select', icon: 'Wand2', options: ['Standard HD', 'Premium Airbrush', 'Signature Look'] }
      ],
      vendorFormFields: [
        { id: 'travels', label: 'Travels to Venue?', type: 'select', options: ['Yes', 'No'] },
        { id: 'trialAvailable', label: 'Trial Available?', type: 'select', options: ['Yes (Paid)', 'Yes (Free)', 'No Trial'] },
        { id: 'brandsUsed', label: 'Top Brands Used (e.g. MAC, Huda)', type: 'text', placeholder: 'Enter top brands...' }
      ]
    };
  }

  // 4. Mehndi Designers
  if (category === 'Mehndi Designers') {
    return {
      aboutTitle: 'About the Artist',
      featuresTitle: 'Design Expertise',
      pricingUnit: '/ bridal package',
      featuresList: [
        'Organic Henna', 'Bridal Portrait Designs', 'Arabic Mehndi',
        'Traditional Indian Designs', 'Color Guarantee', 'Travels to Venue'
      ],
      bookingFields: [
        { id: 'date', label: 'Event Date', type: 'date', icon: 'Calendar' },
        { id: 'designType', label: 'Design Type', type: 'select', icon: 'Flower2', options: ['Bridal Mehndi (Full Hands & Legs)', 'Guest Mehndi (Hourly Rate)', 'Minimalist/Arabic Design'] },
        { id: 'guestsCount', label: 'Number of Guests', type: 'select', icon: 'Users', options: ['Just the Bride', 'Bride + Up to 10 Guests', 'Bride + 20+ Guests'] }
      ],
      vendorFormFields: [
        { id: 'organicHenna', label: 'Use Organic Henna?', type: 'select', options: ['Yes', 'No'] },
        { id: 'teamSize', label: 'Team Size', type: 'number', placeholder: 'e.g. 3' },
        { id: 'hourlyRate', label: 'Hourly Rate for Guests (₹)', type: 'number', placeholder: 'e.g. 1000' }
      ]
    };
  }

  // 5. Wedding Clothes / Boutiques
  if (category === 'Wedding Clothes / Boutiques') {
    return {
      aboutTitle: 'About the Boutique',
      featuresTitle: 'Clothing Services',
      pricingUnit: '/ outfit',
      featuresList: [
        'Custom Stitching', 'Bridal Lehengas', 'Groom Sherwanis',
        'Rental Options Available', 'In-house Alterations', 'Trial Rooms'
      ],
      bookingFields: [
        { id: 'date', label: 'Delivery Date Required', type: 'date', icon: 'Calendar' },
        { id: 'clothingType', label: 'Looking For', type: 'select', icon: 'Shirt', options: ['Bridal Lehenga', 'Groom Sherwani', 'Pattu Sarees', 'Matching Family Sets'] },
        { id: 'service', label: 'Service', type: 'select', icon: 'Scissors', options: ['Purchase (Readymade)', 'Purchase (Custom Tailored)', 'Rental'] }
      ],
      vendorFormFields: [
        { id: 'customTailoring', label: 'Custom Tailoring Available?', type: 'select', options: ['Yes', 'No'] },
        { id: 'rentalAvailable', label: 'Rental Option Available?', type: 'select', options: ['Yes', 'No'] },
        { id: 'deliveryTime', label: 'Average Delivery Time (Days)', type: 'number', placeholder: 'e.g. 15' }
      ]
    };
  }

  // 6. Jewelry Shops
  if (category === 'Jewelry Shops') {
    return {
      aboutTitle: 'About the Jeweler',
      featuresTitle: 'Jewelry Services',
      pricingUnit: '/ set',
      featuresList: [
        'Gold & Diamonds (Hallmarked)', 'Antique Temple Jewelry', 'Rental Jewelry Available',
        'Custom Designs', 'Polki & Kundan Sets', 'Lifetime Exchange'
      ],
      bookingFields: [
        { id: 'date', label: 'Required By Date', type: 'date', icon: 'Calendar' },
        { id: 'jewelryType', label: 'Looking For', type: 'select', icon: 'Gem', options: ['Bridal Set Purchase', 'Bridal Set Rental', 'Engagement Rings', 'Gifting Items'] },
        { id: 'material', label: 'Preferred Material', type: 'select', icon: 'Sparkles', options: ['Gold 22k', 'Diamond / Platinum', 'Imitation / Rental'] }
      ],
      vendorFormFields: [
        { id: 'hallmarkCertified', label: 'Hallmark Certified?', type: 'select', options: ['Yes', 'No'] },
        { id: 'customDesigns', label: 'Custom Designs Available?', type: 'select', options: ['Yes', 'No'] },
        { id: 'buybackPolicy', label: 'Buyback Policy Available?', type: 'select', options: ['Yes', 'No'] }
      ]
    };
  }

  // 7. DJs & Live Musicians
  if (['DJs & Sound Systems', 'Live Musicians / Band Baaja'].includes(category)) {
    return {
      aboutTitle: 'About the Entertainment',
      featuresTitle: 'Entertainment Features',
      pricingUnit: '/ event',
      featuresList: [
        'Professional Sound System', 'Lighting & Smoke Effects', 'Custom Playlists',
        'Emcee / Anchoring Services', 'Backup Equipment', 'Travels to Venue'
      ],
      bookingFields: [
        { id: 'date', label: 'Event Date', type: 'date', icon: 'Calendar' },
        { id: 'duration', label: 'Duration', type: 'select', icon: 'Clock', options: ['3-4 Hours', 'Half Day (5-8 Hours)', 'Full Day'] },
        { id: 'setupRequired', label: 'Sound Setup', type: 'select', icon: 'Speaker', options: ['Performance Only (Venue has sound)', 'Full Setup (Sound + Lights + Artist)'] }
      ],
      vendorFormFields: [
        { id: 'ownSoundEquipment', label: 'Own Sound Equipment?', type: 'select', options: ['Yes', 'No'] },
        { id: 'genreSpecialties', label: 'Genre Specialties (e.g. Bollywood, EDM)', type: 'text', placeholder: 'Enter genres...' },
        { id: 'languages', label: 'Languages/Regions', type: 'text', placeholder: 'e.g. Hindi, Telugu, English' }
      ]
    };
  }

  // 8. Event Planners
  if (category === 'Event Planners') {
    return {
      aboutTitle: 'About the Planner',
      featuresTitle: 'Planning Services',
      pricingUnit: '/ wedding',
      featuresList: [
        'End-to-End Management', 'Vendor Coordination', 'Budget Management',
        'Theme Curation', 'Guest Hospitality', 'On-Day Coordination'
      ],
      bookingFields: [
        { id: 'date', label: 'Wedding Date', type: 'date', icon: 'Calendar' },
        { id: 'planningType', label: 'Service Scope', type: 'select', icon: 'ClipboardCheck', options: ['Full Wedding Planning', 'Partial Planning', 'Day-Of Coordination'] },
        { id: 'guestSize', label: 'Expected Guests', type: 'select', icon: 'Users', options: ['Intimate (< 150)', 'Standard (150 - 500)', 'Grand (500+)'] }
      ],
      vendorFormFields: [
        { id: 'destinationWeddings', label: 'Handle Destination Weddings?', type: 'select', options: ['Yes', 'No'] },
        { id: 'inhouseProduction', label: 'In-house Decor Production?', type: 'select', options: ['Yes', 'No'] },
        { id: 'minimumBudget', label: 'Minimum Budget Requirement (₹)', type: 'number', placeholder: 'e.g. 500000' }
      ]
    };
  }

  // 9. Astrologers / Pundits
  if (category === 'Astrologers / Pundits') {
    return {
      aboutTitle: 'About the Pandit Ji',
      featuresTitle: 'Vedic Services',
      pricingUnit: '/ session',
      featuresList: [
        'Muhurtham Fixing', 'Horoscope Matching (Kundali)', 'Pooja Samagri Provided',
        'Online Consultations', 'Vastu Consultation', 'Multi-lingual Support'
      ],
      bookingFields: [
        { id: 'date', label: 'Consultation Date', type: 'date', icon: 'Calendar' },
        { id: 'serviceRequired', label: 'Service Required', type: 'select', icon: 'MoonStar', options: ['Wedding Muhurtham & Kundali', 'Marriage Ceremony Officiation', 'General Consultation / Pooja'] },
        { id: 'mode', label: 'Mode of Service', type: 'select', icon: 'MonitorSmartphone', options: ['Online / Video Call', 'In-Person (at Home/Venue)'] }
      ],
      vendorFormFields: [
        { id: 'languagesSpoken', label: 'Languages Spoken', type: 'text', placeholder: 'e.g. Hindi, Sanskrit, Telugu' },
        { id: 'onlineConsultations', label: 'Provide Online Consultations?', type: 'select', options: ['Yes', 'No'] },
        { id: 'poojaSamagri', label: 'Provide Pooja Samagri?', type: 'select', options: ['Yes', 'No'] }
      ]
    };
  }

  // 10. Cars & Buses (Travel)
  if (category === 'Cars & Buses (Travel)') {
    return {
      aboutTitle: 'About the Fleet',
      featuresTitle: 'Transport Features',
      pricingUnit: '/ vehicle',
      featuresList: [
        'Luxury Bridal Cars', 'AC Buses for Guests', 'Professional Drivers',
        'Floral Decoration Included', 'Outstation Travel', 'Punctuality Guarantee'
      ],
      bookingFields: [
        { id: 'date', label: 'Travel Date', type: 'date', icon: 'Calendar' },
        { id: 'vehicleType', label: 'Vehicle Type', type: 'select', icon: 'Car', options: ['Luxury Bridal Car (Audi/BMW/Jaguar)', 'AC Bus (40-50 Seater)', 'Mini Bus/Tempo Traveller (15-20 Seater)'] },
        { id: 'duration', label: 'Rental Duration', type: 'select', icon: 'Clock', options: ['Half Day (4 hrs / 40 km)', 'Full Day (8 hrs / 80 km)', 'Outstation Trip'] }
      ],
      vendorFormFields: [
        { id: 'driverIncluded', label: 'Driver Included?', type: 'select', options: ['Yes', 'No'] },
        { id: 'minimumHours', label: 'Minimum Rental Hours', type: 'number', placeholder: 'e.g. 4' },
        { id: 'outstationTravel', label: 'Available for Outstation?', type: 'select', options: ['Yes', 'No'] }
      ]
    };
  }

  // 11. Honeymoon Packages
  if (category === 'Honeymoon Packages') {
    return {
      aboutTitle: 'About the Travel Agency',
      featuresTitle: 'Package Highlights',
      pricingUnit: '/ couple',
      featuresList: [
        'Flights & Transfers Included', 'Luxury 4/5 Star Stays', 'Romantic Candlelight Dinners',
        'Visa Assistance', 'Customizable Itinerary', '24/7 On-Trip Support'
      ],
      bookingFields: [
        { id: 'date', label: 'Preferred Travel Date', type: 'date', icon: 'Calendar' },
        { id: 'destination', label: 'Destination Type', type: 'select', icon: 'Plane', options: ['Domestic (Kerala, Goa, Kashmir)', 'International (Maldives, Bali, Dubai)', 'Europe / Premium International'] },
        { id: 'duration', label: 'Duration', type: 'select', icon: 'Clock', options: ['3-4 Nights', '5-7 Nights', '8+ Nights'] }
      ],
      vendorFormFields: [
        { id: 'visaAssistance', label: 'Provide Visa Assistance?', type: 'select', options: ['Yes', 'No'] },
        { id: 'emiOptions', label: 'EMI Options Available?', type: 'select', options: ['Yes', 'No'] },
        { id: 'customItineraries', label: 'Custom Itineraries Available?', type: 'select', options: ['Yes', 'No'] }
      ]
    };
  }

  // 12. Catering Service
  if (category === 'Catering Service') {
    return {
      aboutTitle: 'About the Caterer',
      featuresTitle: 'Culinary Services',
      pricingUnit: '/ plate',
      featuresList: [
        'Pure Vegetarian Available', 'Non-Vegetarian Options', 'Live Counters',
        'Dessert Stations', 'Crockery Included', 'Service Staff Provided'
      ],
      customBlocks: {
        pricingPackages: [
          { title: 'Vegetarian Menu', price: '₹800 / plate', desc: '4 Starters, 4 Mains, 2 Breads, 2 Desserts' },
          { title: 'Non-Veg Menu', price: '₹1,200 / plate', desc: 'Includes Chicken & Mutton delicacies' }
        ],
        cuisineTags: ['North Indian', 'South Indian', 'Mughlai', 'Chinese', 'Italian / Continental', 'Live Chaat Counters']
      },
      bookingFields: [
        { id: 'date', label: 'Event Date', type: 'date', icon: 'Calendar' },
        { id: 'guests', label: 'Guest Count', type: 'select', icon: 'Users', options: ['100 - 300 Guests', '300 - 500 Guests', '500+ Guests'] },
        { id: 'menuType', label: 'Menu Selection', type: 'select', icon: 'Utensils', options: ['Standard Veg', 'Premium Veg', 'Standard Non-Veg', 'Premium Non-Veg'] }
      ],
      vendorFormFields: [
        { id: 'pureVegAvailable', label: 'Pure Veg Kitchen Available?', type: 'select', options: ['Yes', 'No'] },
        { id: 'liveCounters', label: 'Live Counters Setup Available?', type: 'select', options: ['Yes', 'No'] },
        { id: 'tastingAvailable', label: 'Food Tasting Available?', type: 'select', options: ['Yes (Paid)', 'Yes (Free)', 'No'] }
      ]
    };
  }

  // 13. Stage & Venue Decor
  if (category === 'Stage & Venue Decor') {
    return {
      aboutTitle: 'About the Decorator',
      featuresTitle: 'Decor Capabilities',
      pricingUnit: '/ event',
      featuresList: [
        'Floral Decor', 'Lighting & Mandap', 'Entrance Setup',
        'Theme Based Designs', 'Props & Furniture', 'Stage Setup'
      ],
      customBlocks: {
        pricingPackages: [
          { title: 'Indoor Banquet Decor', price: 'Starting ₹50,000', desc: 'Standard Floral Mandap + Stage Setup' },
          { title: 'Outdoor Lawn Decor', price: 'Starting ₹1,50,000', desc: 'Grand Entrances, Tents, and Premium Lighting' }
        ],
        cuisineTags: ['Theme Weddings', 'Floral Arches', 'Mandap Experts', 'Sangeet Decor', 'Mehendi Setup'] // Reusing tag style
      },
      bookingFields: [
        { id: 'date', label: 'Event Date', type: 'date', icon: 'Calendar' },
        { id: 'eventType', label: 'Event Type', type: 'select', icon: 'Tent', options: ['Wedding', 'Reception', 'Haldi/Mehendi', 'Corporate Event'] },
        { id: 'budget', label: 'Decor Budget', type: 'select', icon: 'Wallet', options: ['Standard (₹50k - ₹1L)', 'Premium (₹1L - ₹3L)', 'Luxury (₹3L+)'] }
      ],
      vendorFormFields: [
        { id: 'mockupsProvided', label: '3D Mockups Provided?', type: 'select', options: ['Yes', 'No'] },
        { id: 'inhouseFlorist', label: 'In-house Florist?', type: 'select', options: ['Yes', 'No'] },
        { id: 'setupTime', label: 'Average Setup Time (Hours)', type: 'number', placeholder: 'e.g. 12' }
      ]
    };
  }

  // 14. Wedding Cards & Invites
  if (category === 'Wedding Cards & Invites') {
    return {
      aboutTitle: 'About the Designer',
      featuresTitle: 'Invitation Types',
      pricingUnit: '/ card',
      featuresList: [
        'Traditional Print Cards', 'Digital E-Invites', 'WhatsApp Video Invites',
        'Custom Caricatures', 'Box Invitations', 'Express Delivery'
      ],
      bookingFields: [
        { id: 'date', label: 'Delivery Date Required', type: 'date', icon: 'Calendar' },
        { id: 'inviteType', label: 'Type of Invite', type: 'select', icon: 'MailOpen', options: ['Printed Cards', 'Digital Video/PDF', 'Premium Boxed Invites'] },
        { id: 'quantity', label: 'Quantity (if physical)', type: 'select', icon: 'Layers', options: ['Digital Only (0)', '100 - 300 Copies', '300 - 500 Copies', '500+ Copies'] }
      ],
      vendorFormFields: [
        { id: 'digitalInvites', label: 'Digital E-Invites Available?', type: 'select', options: ['Yes', 'No'] },
        { id: 'minimumOrder', label: 'Minimum Order Quantity', type: 'number', placeholder: 'e.g. 100' },
        { id: 'customCaricatures', label: 'Custom Caricatures Available?', type: 'select', options: ['Yes', 'No'] }
      ]
    };
  }

  // Fallback for anything else missing a highly specific override
  return {
    aboutTitle: 'About this Vendor',
    featuresTitle: 'Service Highlights',
    pricingUnit: '/ booking',
    featuresList: [
      'Professional Service', 'On-time Delivery', 'Customizable Packages',
      'Experienced Team', 'Premium Quality', 'Consultation Available'
    ],
    bookingFields: [
      { id: 'date', label: 'Event Date', type: 'date', icon: 'Calendar' },
      { id: 'requirements', label: 'Requirements', type: 'select', icon: 'ListChecks', options: ['Standard Requirements', 'Custom Bespoke Service', 'Premium Luxury Service'] }
    ],
    vendorFormFields: [
      { id: 'teamSize', label: 'Team Size', type: 'number', placeholder: 'e.g. 2' },
      { id: 'travels', label: 'Travels to outstation?', type: 'select', options: ['Yes', 'No'] }
    ]
  };
};
