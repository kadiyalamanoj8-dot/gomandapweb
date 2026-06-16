import React, { useMemo, useState } from 'react';
import { X, SlidersHorizontal, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CATEGORIES, CATEGORY_BUCKETS } from '../../data/mockData';
import { useSettings } from '../../context/SettingsContext';
import * as Icons from 'lucide-react';

const IconComponent = ({ name, ...props }) => {
  const Icon = Icons[name] || Icons.HelpCircle;
  return <Icon {...props} />;
};

// Native fallback filters for each schema type - CATEGORY SPECIFIC
const NATIVE_FILTERS = {
  VENUE: [
    { name: 'capacity', title: 'Guest Capacity', type: 'RADIO', options: [
      { value: 'any', label: 'Any' },
      { value: 'less-100', label: 'Less than 100' },
      { value: '100-250', label: '100 to 250' },
      { value: '250-500', label: '250 to 500' },
      { value: '500-1000', label: '500 to 1000' },
      { value: '1000+', label: '1000 and above' }
    ]},
    { name: 'eventsCovered', title: 'Event Types Covered', type: 'CHECKBOX', options: [
      { value: 'Weddings', label: 'Weddings & Receptions' },
      { value: 'Corporate Events', label: 'Corporate Events' },
      { value: 'Corporate Conferences (MICE)', label: 'Corporate Conferences (MICE)' },
      { value: 'Corporate Offsites', label: 'Corporate Offsites' },
      { value: 'Birthdays & Parties', label: 'Birthdays & Parties' },
      { value: 'Pre-Wedding Functions', label: 'Pre-Wedding (Haldi/Mehendi)' }
    ]},
    { name: 'inHouseCatering', title: 'Catering Policy', type: 'CHECKBOX', options: [
      { value: 'In-house Only', label: 'In-house Catering Only' },
      { value: 'Outside Allowed', label: 'Outside Allowed' },
      { value: 'Both Available', label: 'Both Available' }
    ]},
    { name: 'inHouseDecorations', title: 'Decor Policy', type: 'CHECKBOX', options: [
      { value: 'In-house Only', label: 'In-house Decor Only' },
      { value: 'Outside Allowed', label: 'Outside Allowed' },
      { value: 'Both Available', label: 'Both Available' }
    ]},
    { name: 'alcoholPolicy', title: 'Alcohol Policy', type: 'CHECKBOX', options: [
      { value: 'Allowed (With License)', label: 'Outside Alcohol Allowed' },
      { value: 'Allowed (In-house provided)', label: 'In-house Alcohol Available' },
      { value: 'Not Allowed', label: 'Strictly No Alcohol' }
    ]},
    { name: 'djPolicy', title: 'DJ & Music Policy', type: 'CHECKBOX', options: [
      { value: 'In-house Only', label: 'In-house DJ Only' },
      { value: 'Outside DJ Allowed', label: 'Outside DJ Allowed' },
      { value: 'Late-night Allowed', label: 'Late Night Music Allowed' }
    ]},
    { name: 'poolAvailable', title: 'Pool / Water Feature', type: 'CHECKBOX', options: [
      { value: 'Yes - Available for Events', label: 'Pool Available' }
    ]},
    { name: 'avSetup', title: 'AV & Corporate Setup', type: 'CHECKBOX', options: [
      { value: 'LED Video Walls', label: 'LED Video Walls' },
      { value: 'High-Lumen Projectors', label: 'High-Lumen Projectors' },
      { value: 'Live Streaming/Hybrid Setup', label: 'Hybrid Event Support' }
    ]}
  ],
  PHOTO: [
    { name: 'eventsCovered', title: 'Event Type', type: 'CHECKBOX', options: [
      { value: 'Weddings & Receptions', label: 'Weddings & Receptions' },
      { value: 'Corporate Events', label: 'Corporate Events' },
      { value: 'Birthdays/Anniversaries', label: 'Birthdays & Anniversaries' },
      { value: 'Pre-Wedding (Haldi/Mehendi)', label: 'Pre-Wedding (Haldi/Mehendi)' },
      { value: 'Concerts/Festivals', label: 'Concerts & Festivals' }
    ]},
    { name: 'serviceTypes', title: 'Services Offered', type: 'CHECKBOX', options: [
      { value: 'Candid Photography', label: 'Candid Photography' },
      { value: 'Traditional Photography', label: 'Traditional Photography' },
      { value: 'Cinematic Videography', label: 'Cinematic Videography' },
      { value: 'Drone Shoots', label: 'Drone Shoots' },
      { value: 'Photobooths', label: 'Photobooths' }
    ]},
    { name: 'corporateSpecific', title: 'Corporate Services', type: 'CHECKBOX', options: [
      { value: 'Headshots', label: 'Headshots' },
      { value: 'Same-day PR Edits', label: 'Same-day PR Edits' },
      { value: 'Multi-camera Streaming', label: 'Multi-camera Streaming' }
    ]},
    { name: 'travelPolicy', title: 'Travel Policy', type: 'CHECKBOX', options: [
      { value: 'Outstation travel & stay paid by client', label: 'Outstation (Client pays travel)' },
      { value: 'Included in package', label: 'Travel Included in Package' },
      { value: 'Does not travel outstation', label: 'Local Only' }
    ]},
    { name: 'deliveryTime', title: 'Delivery Timeline', type: 'CHECKBOX', options: [
      { value: '2 Weeks', label: '2 Weeks' },
      { value: '4 Weeks', label: '4 Weeks' },
      { value: '8+ Weeks', label: '8+ Weeks' }
    ]},
    { name: 'priceRange', title: 'Price Range', type: 'RADIO', options: [
      { value: 'any', label: 'Any Budget' },
      { value: '20000-50000', label: '₹20K - ₹50K' },
      { value: '50000-100000', label: '₹50K - ₹1L' },
      { value: '100000-200000', label: '₹1L - ₹2L' },
      { value: '200000+', label: '₹2L+' }
    ]}
  ],
  MAKEUP: [
    { name: 'makeupTechnique', title: 'Makeup Techniques', type: 'CHECKBOX', options: [
      { value: 'HD Makeup', label: 'HD Makeup' },
      { value: 'Airbrush', label: 'Airbrush' },
      { value: 'Traditional', label: 'Traditional' },
      { value: 'Mineral/Organic', label: 'Mineral/Organic' }
    ]},
    { name: 'corporateSpecific', title: 'Corporate Services', type: 'CHECKBOX', options: [
      { value: 'Corporate Headshots', label: 'Corporate Headshots' },
      { value: 'Commercial/Ad Shoots', label: 'Commercial/Ad Shoots' },
      { value: 'TV/Film Set Makeup', label: 'TV/Film Set Makeup' }
    ]},
    { name: 'trialAvailable', title: 'Trial Policy', type: 'CHECKBOX', options: [
      { value: 'Yes (Paid)', label: 'Paid Trial Available' },
      { value: 'Yes (Free)', label: 'Free Trial Available' },
      { value: 'No Trial', label: 'No Trial' }
    ]}
  ],
  CATERING: [
    { name: 'eventsCovered', title: 'Event Type', type: 'CHECKBOX', options: [
      { value: 'Weddings & Receptions', label: 'Weddings & Receptions' },
      { value: 'Corporate Events', label: 'Corporate Events' },
      { value: 'Birthdays/Anniversaries', label: 'Birthdays & Anniversaries' },
      { value: 'Pre-Wedding (Haldi/Mehendi)', label: 'Pre-Wedding (Haldi/Mehendi)' },
      { value: 'Concerts/Festivals', label: 'Concerts & Festivals' }
    ]},
    { name: 'cuisineTypes', title: 'Cuisine Types', type: 'CHECKBOX', options: [
      { value: 'North Indian', label: 'North Indian' },
      { value: 'South Indian', label: 'South Indian' },
      { value: 'Chinese', label: 'Chinese' },
      { value: 'Continental', label: 'Continental' },
      { value: 'Live Chaat', label: 'Live Chaat Counters' },
      { value: 'Bakery/Desserts', label: 'Bakery & Desserts' }
    ]},
    { name: 'dietaryRestrictions', title: 'Dietary Options', type: 'CHECKBOX', options: [
      { value: 'Pure Veg Only', label: 'Pure Veg Only' },
      { value: 'Serves Non-Veg', label: 'Non-Veg Available' },
      { value: 'Jain Food Available', label: 'Jain Food Available' },
      { value: 'Vegan Options', label: 'Vegan Options' }
    ]},
    { name: 'corporateSpecific', title: 'Corporate Options', type: 'CHECKBOX', options: [
      { value: 'Coffee Breaks', label: 'Coffee Breaks' },
      { value: 'High-Tea Setups', label: 'High-Tea Setups' },
      { value: 'Working Lunches', label: 'Working Lunches' },
      { value: 'Packed Meals', label: 'Packed Meals' }
    ]},
    { name: 'includesStaff', title: 'Waitstaff Included', type: 'CHECKBOX', options: [
      { value: 'Yes', label: 'Waitstaff Included' },
      { value: 'Extra Charge', label: 'Available (Extra Charge)' }
    ]},
    { name: 'pricePerPlate', title: 'Price Per Plate', type: 'RADIO', options: [
      { value: 'any', label: 'Any Budget' },
      { value: '500-1000', label: '₹500 - ₹1,000' },
      { value: '1000-1500', label: '₹1,000 - ₹1,500' },
      { value: '1500-2000', label: '₹1,500 - ₹2,000' },
      { value: '2000+', label: '₹2,000+' }
    ]}
  ],
  DECOR: [
    { name: 'eventsCovered', title: 'Event Type', type: 'CHECKBOX', options: [
      { value: 'Weddings & Receptions', label: 'Weddings & Receptions' },
      { value: 'Corporate Events', label: 'Corporate Events' },
      { value: 'Birthdays/Anniversaries', label: 'Birthdays & Anniversaries' },
      { value: 'Pre-Wedding (Haldi/Mehendi)', label: 'Pre-Wedding (Haldi/Mehendi)' },
      { value: 'Concerts/Festivals', label: 'Concerts & Festivals' }
    ]},
    { name: 'specializations', title: 'Decor Specialization', type: 'CHECKBOX', options: [
      { value: 'Floral Decor', label: 'Floral Decor' },
      { value: 'Mandap Setup', label: 'Mandap Setup' },
      { value: 'Stage & Reception', label: 'Stage & Reception' },
      { value: 'Corporate Stage & Branding', label: 'Corporate Stage & Branding' },
      { value: 'Lighting & Trussing', label: 'Lighting & Trussing' },
      { value: 'Tents/Shamianas', label: 'Tents & Shamianas' }
    ]},
    { name: 'corporateSpecific', title: 'Corporate AV & Stage', type: 'CHECKBOX', options: [
      { value: 'LED Video Walls', label: 'LED Video Walls' },
      { value: 'Backdrop Logos', label: 'Backdrop Logos' },
      { value: 'Stage Ramps/Accessibility', label: 'Stage Ramps' },
      { value: 'Product Podiums', label: 'Product Podiums' }
    ]},
    { name: 'venueRestrictions', title: 'Venue Flexibility', type: 'CHECKBOX', options: [
      { value: 'Open to work at any venue', label: 'Works at Any Venue' },
      { value: 'Only work at empanelled venues', label: 'Only Empanelled Venues' }
    ]},
    { name: 'planningType', title: 'Planning Scope', type: 'CHECKBOX', options: [
      { value: 'Full Wedding Planning', label: 'Full Wedding Planning' },
      { value: 'Partial Planning', label: 'Partial Planning' },
      { value: 'Month-Of Coordination', label: 'Month-Of Coordination' },
      { value: 'Corporate (MICE) Planning', label: 'Corporate MICE' }
    ]},
    { name: 'specialTrends', title: 'Specialized Event Trends', type: 'CHECKBOX', options: [
      { value: 'Eco-friendly/Sustainable Weddings', label: 'Eco-Friendly Weddings' },
      { value: 'Royal/Heritage Themes', label: 'Royal/Heritage Themes' },
      { value: 'Tech-driven (RSVP Apps/Drones)', label: 'Tech-driven (Drones/Apps)' }
    ]},
    { name: 'priceRange', title: 'Price Range', type: 'RADIO', options: [
      { value: 'any', label: 'Any Budget' },
      { value: '50000-150000', label: '₹50K - ₹1.5L' },
      { value: '150000-300000', label: '₹1.5L - ₹3L' },
      { value: '300000-500000', label: '₹3L - ₹5L' },
      { value: '500000+', label: '₹5L+' }
    ]}
  ],
  DJ: [
    { name: 'serviceTypes', title: 'Service Type', type: 'CHECKBOX', options: [
      { value: 'DJ Only', label: 'DJ Only' },
      { value: 'Live Band', label: 'Live Band' },
      { value: 'Live Singers', label: 'Live Singers' },
      { value: 'Orchestra', label: 'Orchestra' },
      { value: 'Emcee/Anchor', label: 'Emcee/Anchor' },
      { value: 'Sound System Only', label: 'Sound System Only' }
    ]},
    { name: 'musicGenre', title: 'Music Genre', type: 'CHECKBOX', options: [
      { value: 'Bollywood', label: 'Bollywood' },
      { value: 'EDM/House', label: 'EDM/House' },
      { value: 'Sufi/Classical', label: 'Sufi/Classical' },
      { value: 'Western/Pop', label: 'Western/Pop' },
      { value: 'Regional/Folk', label: 'Regional/Folk' }
    ]},
    { name: 'soundSetup', title: 'Sound Setup Provided', type: 'CHECKBOX', options: [
      { value: 'Performance Only (Venue has sound)', label: 'Performance Only' },
      { value: 'Full Setup (Sound + Lights)', label: 'Full Setup (Sound + Lights)' },
      { value: 'PA System Only', label: 'PA System Only' }
    ]},
    { name: 'danceStyles', title: 'Dance Styles', type: 'CHECKBOX', options: [
      { value: 'Bollywood', label: 'Bollywood' },
      { value: 'Punjabi / Bhangra', label: 'Punjabi / Bhangra' },
      { value: 'Classical', label: 'Classical' },
      { value: 'Hip-Hop', label: 'Hip-Hop' },
      { value: 'Contemporary', label: 'Contemporary' }
    ]},
    { name: 'practiceLocation', title: 'Practice Location', type: 'CHECKBOX', options: [
      { value: 'Choreographer Studio', label: 'At Studio' },
      { value: 'Client Venue/Home', label: 'At Client Home' },
      { value: 'Both Available', label: 'Both' }
    ]},
    { name: 'actTypes', title: 'Entertainment Acts', type: 'CHECKBOX', options: [
      { value: 'Fire Dancers', label: 'Fire Dancers' },
      { value: 'Magicians / Illusionists', label: 'Magicians' },
      { value: 'Aerial / Acrobats', label: 'Aerial / Acrobats' },
      { value: 'Stand-up Comedy', label: 'Stand-up Comedy' },
      { value: 'Celebrity Appearances', label: 'Celebrity Appearances' }
    ]}
  ],
  JEWELRY: [
    { name: 'serviceModel', title: 'Service Model', type: 'CHECKBOX', options: [
      { value: 'Purchase (Readymade)', label: 'Purchase (Readymade)' },
      { value: 'Custom Tailoring/Bespoke', label: 'Custom Tailoring/Bespoke' },
      { value: 'Rental Services', label: 'Rental Services' }
    ]},
    { name: 'materialSpecialty', title: 'Jewelry Material', type: 'CHECKBOX', options: [
      { value: 'Gold 22k/24k', label: 'Gold 22k/24k' },
      { value: 'Diamond/Platinum', label: 'Diamond/Platinum' },
      { value: 'Imitation/Kundan', label: 'Imitation/Kundan' },
      { value: 'Antique Temple Jewelry', label: 'Antique Temple Jewelry' }
    ]},
    { name: 'deliveryTimeline', title: 'Delivery Timeline (Apparel)', type: 'CHECKBOX', options: [
      { value: 'Immediate (Off the rack)', label: 'Immediate (Off the rack)' },
      { value: '2-4 Weeks', label: '2-4 Weeks' },
      { value: '4-6 Months (Custom)', label: '4-6 Months (Custom)' }
    ]}
  ],
  LOGISTICS: [
    { name: 'vehicleTypes', title: 'Transport Options', type: 'CHECKBOX', options: [
      { value: 'Luxury Bridal Cars (Audi/BMW)', label: 'Luxury Bridal Cars' },
      { value: 'Vintage & Classic Cars', label: 'Vintage Cars' },
      { value: 'Large AC Buses (40-50 Seater)', label: 'Buses (40-50 Seater)' },
      { value: 'Mini Buses (20-30 Seater)', label: 'Mini Buses (20-30 Seater)' },
      { value: 'Tempo Travellers (12-15 Seater)', label: 'Tempo Travellers' },
      { value: 'Helicopter/Charter (Entry)', label: 'Helicopter Entry' }
    ]},
    { name: 'videoInvites', title: 'Video & Digital Invites', type: 'CHECKBOX', options: [
      { value: '3D Animation & Caricatures', label: '3D Caricatures' },
      { value: 'Cinematic Love Story Videos', label: 'Cinematic Videos' },
      { value: 'WhatsApp Optimized MP4 Templates', label: 'WhatsApp Videos' }
    ]},
    { name: 'consultationMode', title: 'Consultation Mode', type: 'CHECKBOX', options: [
      { value: 'Online/Video Call', label: 'Online / Video Call' },
      { value: 'AI Chatbot Consultations', label: 'AI Chatbot Consultations' },
      { value: 'In-Person (At Home/Venue)', label: 'In-Person' }
    ]},
    { name: 'servicesProvided', title: 'Astrology/Pundit Services', type: 'CHECKBOX', options: [
      { value: 'Traditional Horoscope Matching', label: 'Traditional Matching' },
      { value: 'AI-Powered Kundali Matching', label: 'AI Kundali Matching' },
      { value: 'Vivah Pooja (Saptapadi/Havan)', label: 'Vivah Pooja (Saptapadi)' }
    ]},
    { name: 'languagesSpoken', title: 'Languages', type: 'CHECKBOX', options: [
      { value: 'Hindi', label: 'Hindi' },
      { value: 'Sanskrit', label: 'Sanskrit' },
      { value: 'Telugu', label: 'Telugu' },
      { value: 'Marathi', label: 'Marathi' }
    ]},
    { name: 'destinations', title: 'Honeymoon Destinations', type: 'CHECKBOX', options: [
      { value: 'Domestic (Kashmir, Kerala, Goa)', label: 'Domestic India' },
      { value: 'International (Bali, Maldives, Dubai)', label: 'Asia & Middle East' },
      { value: 'Premium (Europe, Americas)', label: 'Europe & Americas' }
    ]},
    { name: 'packageInclusions', title: 'Honeymoon Inclusions', type: 'CHECKBOX', options: [
      { value: 'Visa Assistance Provided', label: 'Visa Assistance' },
      { value: 'Flights Included', label: 'Flights Included' }
    ]},
    { name: 'priceRange', title: 'Price Range', type: 'RADIO', options: [
      { value: 'any', label: 'Any Budget' },
      { value: '5000-25000', label: '₹5K - ₹25K' },
      { value: '25000-100000', label: '₹25K - ₹1L' },
      { value: '100000-300000', label: '₹1L - ₹3L' },
      { value: '300000+', label: '₹3L+' }
    ]}
  ]
};

const VENUE_CATEGORIES = ['Banquet Halls', 'Kalyana Mandapams', 'Open Lawns & Farmhouses', 'Resorts & Destination Venues', '5-Star Hotels', 'Party & Mini Halls', 'Temples & Ashrams'];
const PHOTO_CATEGORIES = ['Photography & Videography'];
const MAKEUP_CATEGORIES = ['Makeup Artists (MUA)', 'Mehndi Designers'];
const CATERING_CATEGORIES = ['Catering Service'];
const DECOR_CATEGORIES = ['Stage & Venue Decor', 'Event Planners'];
const DJ_CATEGORIES = ['DJs & Sound Systems', 'Live Musicians / Band Baaja', 'Wedding Choreographers', 'Special Entertainment Acts'];
const JEWELRY_CATEGORIES = ['Wedding Clothes / Boutiques', 'Jewelry Shops'];
const LOGISTICS_CATEGORIES = ['Wedding Cards & Invites', 'Cars & Buses (Travel)', 'Astrologers / Pundits', 'Honeymoon Packages'];

const ICON_MAP = {
  'Banquet Halls':               '/images/resized/3d_venue copy.webp',
  'Kalyana Mandapams':           '/images/resized/temple_mandap copy.webp',
  'Open Lawns & Farmhouses':     '/images/resized/3d_lawn_farmhouse_1780657291134 copy.webp',
  'Resorts & Destination Venues':'/images/resized/modern_gazebo copy.webp',
  '5-Star Hotels':               '/images/resized/3d_5star_hotel_1780657276128 copy.webp',
  'Party & Mini Halls':          '/images/resized/neon_sangeet_stage copy.webp',
  'Temples & Ashrams':           '/images/resized/temple_mandap copy.webp',
  'Catering Service':            '/images/resized/3d_food copy.webp',
  'Stage & Venue Decor':         '/images/resized/3d_decor copy.webp',
  'Photography & Videography':   '/images/resized/3d_camera copy.webp',
  'DJs & Sound Systems':         '/images/resized/3d_dj copy.webp',
  'Live Musicians / Band Baaja': '/images/resized/3d_band copy.webp',
  'Makeup Artists (MUA)':        '/images/resized/3d_makeup copy.webp',
  'Mehndi Designers':            '/images/resized/3d_mehndi_1780657262687 copy.webp',
  'Wedding Clothes / Boutiques': '/images/resized/3d_clothes copy.webp',
  'Jewelry Shops':               '/images/resized/3d_jewelry copy.webp',
  'Wedding Cards & Invites':     '/images/resized/3d_invitation copy.webp',
  'Cars & Buses (Travel)':       '/images/resized/3d_car copy.webp',
  'Astrologers / Pundits':       '/images/resized/3d_astrologer copy.webp',
  'Honeymoon Packages':          '/images/resized/3d_honeymoon copy.webp',
  'Event Planners':              '/images/resized/3d_planner copy.webp',
};

const FilterSidebar = ({ isMobileOpen, setIsMobileOpen, selectedCategories = [], toggleCategory }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isCategoryEnabled } = useSettings();
  
  const handleDynamicFilterChange = (field, value, type, checked) => {
    const newParams = new URLSearchParams(searchParams);
    
    // Special named params that go to their own API query param (not dynamic_)
    const NAMED_PARAMS = ['capacity'];
    
    if (NAMED_PARAMS.includes(field)) {
      if (type === 'RADIO') {
        if (value === 'any') newParams.delete(field);
        else newParams.set(field, value);
      } else {
        if (checked) newParams.set(field, 'true');
        else newParams.delete(field);
      }
    } else {
      const paramKey = `dynamic_${field}`;
      if (type === 'RADIO') {
        if (value === 'any') newParams.delete(paramKey);
        else newParams.set(paramKey, value);
      } else if (type === 'CHECKBOX') {
        const currentVals = newParams.getAll(paramKey);
        newParams.delete(paramKey);
        let newVals = [...currentVals];
        if (checked) newVals.push(value);
        else newVals = newVals.filter(v => v !== value);
        newVals.forEach(v => newParams.append(paramKey, v));
      }
    }
    setSearchParams(newParams);
  };

  const mobileClasses = isMobileOpen 
    ? 'fixed inset-0 z-[100] bg-white overflow-y-auto flex flex-col' 
    : 'hidden md:block';

  const activeSchemas = useMemo(() => {
    const schemas = new Set();
    
    if (selectedCategories.length === 0) {
      schemas.add('VENUE');
      return Array.from(schemas);
    }

    selectedCategories.forEach(cat => {
      if (VENUE_CATEGORIES.includes(cat)) schemas.add('VENUE');
      if (PHOTO_CATEGORIES.includes(cat)) schemas.add('PHOTO');
      if (MAKEUP_CATEGORIES.includes(cat)) schemas.add('MAKEUP');
      if (CATERING_CATEGORIES.includes(cat)) schemas.add('CATERING');
      if (DECOR_CATEGORIES.includes(cat)) schemas.add('DECOR');
      if (DJ_CATEGORIES.includes(cat)) schemas.add('DJ');
      if (JEWELRY_CATEGORIES.includes(cat)) schemas.add('JEWELRY');
      if (LOGISTICS_CATEGORIES.includes(cat)) schemas.add('LOGISTICS');
    });
    
    return Array.from(schemas);
  }, [selectedCategories]);

  const [dynamicFilters, setDynamicFilters] = useState([]);
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);
  const [filterError, setFilterError] = useState(false);

  React.useEffect(() => {
    const fetchFilters = async () => {
      // Use native filters for these schemas without API call
      const nativeSchemas = ['VENUE', 'PHOTO', 'MAKEUP', 'CATERING', 'DECOR', 'DJ', 'JEWELRY', 'LOGISTICS'];
      const nativeFilters = [];
      
      activeSchemas.forEach(schema => {
        if (NATIVE_FILTERS[schema]) {
          nativeFilters.push(...NATIVE_FILTERS[schema]);
        }
      });
      
      setDynamicFilters(nativeFilters);
    };
    
    fetchFilters();
  }, [activeSchemas]);

  const NAMED_PARAMS = ['capacity'];

  const renderDynamicBlock = (block, index) => {
    const uniqueKey = `${block.name}-${block.title}-${index}`;
    if (block.type === 'RADIO') {
      return (
        <div key={uniqueKey} className="mb-6">
          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">{block.title}</h3>
          <div className="flex flex-col gap-3">
            {block.options.map((opt, idx) => {
              const paramKey = NAMED_PARAMS.includes(block.name) ? block.name : `dynamic_${block.name}`;
              const isChecked = searchParams.get(paramKey) === opt.value || (!searchParams.has(paramKey) && idx === 0);
              return (
              <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="radio" 
                  name={uniqueKey} 
                  value={opt.value}
                  checked={isChecked} 
                  className="w-4 h-4 accent-brand-primary cursor-pointer" 
                  onChange={(e) => handleDynamicFilterChange(block.name, e.target.value, 'RADIO')}
                />
                <span className="text-sm font-bold text-gray-600 group-hover:text-brand-primary transition-colors">{opt.label}</span>
              </label>
            )})}
          </div>
        </div>
      );
    }

    if (block.type === 'CHECKBOX') {
      return (
        <div key={uniqueKey} className="mb-6">
          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">{block.title}</h3>
          <div className="flex flex-col gap-3">
            {block.options.map((opt) => {
              const paramKey = NAMED_PARAMS.includes(block.name) ? block.name : `dynamic_${block.name}`;
              const isChecked = searchParams.getAll(paramKey).includes(opt.value);
              return (
              <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  value={opt.value}
                  checked={isChecked}
                  className="w-4 h-4 accent-brand-primary rounded cursor-pointer border-gray-300" 
                  onChange={(e) => handleDynamicFilterChange(block.name, e.target.value, 'CHECKBOX', e.target.checked)}
                />
                <span className="text-sm font-bold text-gray-600 group-hover:text-brand-primary transition-colors">{opt.label}</span>
              </label>
            )})}
          </div>
        </div>
      );
    }
    return null;
  };

  const [expandedBuckets, setExpandedBuckets] = useState(
    CATEGORY_BUCKETS.reduce((acc, bucket) => ({ ...acc, [bucket.id]: true }), {})
  );

  const toggleBucket = (id) => {
    setExpandedBuckets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside className={`${mobileClasses} md:sticky md:top-24 md:h-[calc(100vh-8rem)] md:w-1/4 lg:w-[25%] md:overflow-y-auto no-scrollbar md:bg-white md:rounded-3xl md:shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:border md:border-gray-100 shrink-0`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black text-gray-900 flex items-center gap-2 tracking-tight">
          <SlidersHorizontal size={20} className="text-brand-primary" /> Filters
        </h2>
        <button 
          className="md:hidden p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
          onClick={() => setIsMobileOpen(false)}
        >
          <X size={20} />
        </button>
      </div>

      <div className="space-y-8 md:space-y-6">
        
        {/* Global Search */}
        <div>
          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Global Search</h3>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search vendor, city, category..." 
              value={searchParams.get('q') || ''}
              onChange={(e) => {
                const newParams = new URLSearchParams(searchParams);
                if (e.target.value) newParams.set('q', e.target.value);
                else newParams.delete('q');
                setSearchParams(newParams);
              }}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-9 pr-4 text-sm font-semibold text-gray-700 focus:outline-none focus:border-brand-primary transition-colors"
            />
          </div>
        </div>

        {/* Availability Date Filter */}
        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Event Date (Availability)</h3>
          <div className="relative">
            <input 
              type="date" 
              value={searchParams.get('date') || ''}
              onChange={(e) => {
                const newParams = new URLSearchParams(searchParams);
                if (e.target.value) newParams.set('date', e.target.value);
                else newParams.delete('date');
                setSearchParams(newParams);
              }}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-sm font-semibold text-gray-700 focus:outline-none focus:border-brand-primary transition-colors"
            />
          </div>
        </div>

        {/* Categories Section */}
        <div className="pt-2 border-t border-gray-100">
          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">Browse Categories</h3>
          <div className="flex flex-col gap-4">
            {CATEGORY_BUCKETS.map(bucket => {
              const isActive = bucket.categories.some(c => selectedCategories.includes(c.label));
              const isExpanded = expandedBuckets[bucket.id];
              return (
                <div key={bucket.id} className="flex flex-col">
                  <button 
                    onClick={() => toggleBucket(bucket.id)}
                    className="flex justify-between items-center w-full text-left py-1 group"
                  >
                    <span className={`text-sm font-bold transition-colors ${isActive ? 'text-brand-primary' : 'text-gray-800 group-hover:text-brand-primary'}`}>
                      {bucket.label}
                    </span>
                    {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </button>
                  
                  {isExpanded && (
                    <div className="flex flex-col gap-1.5 mt-2 ml-1">
                      {bucket.categories.map(cat => {
                        if (!isCategoryEnabled(cat.label)) return null;
                        const isSelected = selectedCategories.includes(cat.label);
                        const icon3d = ICON_MAP[cat.label];
                        return (
                          <button
                            key={cat.id}
                            onClick={() => toggleCategory && toggleCategory(cat.label)}
                            className={`flex items-center gap-3 p-2 rounded-xl transition-all ${
                              isSelected 
                                ? 'bg-brand-primary/10 border border-brand-primary/20' 
                                : 'hover:bg-gray-50 border border-transparent'
                            }`}
                          >
                            <div className="w-7 h-7 shrink-0 flex items-center justify-center">
                              {icon3d ? (
                                <img src={icon3d} alt={cat.label} className="w-full h-full object-contain drop-shadow-sm" />
                              ) : (
                                <IconComponent name={cat.iconName} size={16} className={isSelected ? 'text-brand-primary' : 'text-gray-500'} />
                              )}
                            </div>
                            <span className={`text-xs font-bold text-left leading-tight ${isSelected ? 'text-brand-primary' : 'text-gray-600'}`}>
                              {cat.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic MongoDB Filters / Native Filters */}
        <div className="pt-4 border-t border-gray-100 space-y-2">
          {dynamicFilters.length > 0 ? (
            dynamicFilters.map(block => renderDynamicBlock(block))
          ) : (
            <p className="text-xs font-bold text-gray-400 py-4 text-center">No additional filters available</p>
          )}
        </div>

      </div>
      
      {isMobileOpen && (
        <div className="sticky bottom-0 left-0 right-0 p-4 pb-safe bg-white border-t border-gray-100 mt-auto">
          <button 
            className="w-full btn-liquid text-white py-4 rounded-xl font-black shadow-3d hover:shadow-3d-hover active:scale-95 transition-all text-lg"
            onClick={() => setIsMobileOpen(false)}
          >
            Apply Filters
          </button>
        </div>
      )}
    </aside>
  );
};

export default FilterSidebar;
