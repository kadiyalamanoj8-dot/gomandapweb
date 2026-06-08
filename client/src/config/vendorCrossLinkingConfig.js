/* 
  CLIENT SITE SEO CONFIGURATION
  Cross-domain linking between gomandap.com and vendor.gomandap.com
*/

export const SEO_MESSAGES = {
  // Add to category pages
  VENDOR_REGISTRATION_CTA: "Become a {CATEGORY} Vendor",
  VENDOR_REGISTRATION_DESC: "Are you a {CATEGORY}? Join Gomandap's community of verified vendors. 100% FREE registration. Zero commission on first 50 bookings.",
  VENDOR_LINK_TEXT: "Register as {CATEGORY} Vendor",
  
  // Footer messaging
  FOOTER_VENDOR_SECTION_TITLE: "For Vendors",
  FOOTER_VENDOR_LINKS: [
    { text: "Register as Vendor", url: "https://vendor.gomandap.com", icon: "💼" },
    { text: "Vendor Dashboard", url: "https://vendor.gomandap.com/dashboard", icon: "📊" },
    { text: "Partner with Us", url: "https://vendor.gomandap.com", icon: "🤝" }
  ]
};

export const CATEGORY_VENDOR_MAPPING = {
  "photography-videography": {
    slug: "photography-videography",
    vendorUrl: "https://vendor.gomandap.com/onboarding/photography-videography",
    cta: "Register as Photography Vendor - FREE"
  },
  "catering": {
    slug: "catering",
    vendorUrl: "https://vendor.gomandap.com/onboarding/catering",
    cta: "Register as Catering Vendor - FREE"
  },
  "banquet-halls": {
    slug: "banquet-halls",
    vendorUrl: "https://vendor.gomandap.com/onboarding/banquet-halls",
    cta: "Register Banquet Hall - FREE"
  },
  "makeup-artists": {
    slug: "makeup-artists",
    vendorUrl: "https://vendor.gomandap.com/onboarding/makeup-artists",
    cta: "Register as Makeup Artist - FREE"
  },
  "dj-sound-systems": {
    slug: "dj-sound-systems",
    vendorUrl: "https://vendor.gomandap.com/onboarding/dj-sound-systems",
    cta: "Register as DJ Vendor - FREE"
  },
  "decor-planners": {
    slug: "decor-planners",
    vendorUrl: "https://vendor.gomandap.com/onboarding/decor-planners",
    cta: "Register as Event Planner - FREE"
  },
  "jewelry": {
    slug: "jewelry",
    vendorUrl: "https://vendor.gomandap.com/onboarding/jewelry",
    cta: "Register Jewelry Shop - FREE"
  },
  "transportation": {
    slug: "transportation",
    vendorUrl: "https://vendor.gomandap.com/onboarding/transportation",
    cta: "Register Transportation Vendor - FREE"
  }
};

export default {
  SEO_MESSAGES,
  CATEGORY_VENDOR_MAPPING
};
