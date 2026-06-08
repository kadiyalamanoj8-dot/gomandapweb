/* 
  GOMANDAP SEO CONFIGURATION
  This file contains all the FREE onboarding messaging and cross-domain configuration
  that will make both gomandap.com and vendor.gomandap.com visible in Google Search
*/

// SEO Messages for Vendor Site
export const SEO_MESSAGES = {
  // Hero/Main messaging
  HERO_MAIN: "Register as a Wedding Vendor - 100% FREE Registration",
  HERO_SUBTEXT: "Join 1000+ vendors earning through Gomandap. Zero commission on first 50 bookings.",
  FREE_BADGE: "✓ FREE REGISTRATION",
  
  // Category pages
  CATEGORY_TITLE_TEMPLATE: "Register as {CATEGORY} Vendor on Gomandap | FREE Partnership",
  CATEGORY_DESC_TEMPLATE: "Join Gomandap as a {CATEGORY} vendor - 100% FREE. Get access to 10,000+ customers. Zero commission on first 50 bookings. Start earning today.",
  
  // Keywords
  KEYWORDS: [
    // Free onboarding focus
    "vendor registration free",
    "free vendor registration",
    "vendor registration no fee",
    "zero commission vendor",
    "free vendor platform",
    
    // Category-specific
    "photography vendor registration free",
    "catering vendor registration",
    "wedding venue vendor registration",
    "makeup artist vendor registration",
    "DJ vendor registration",
    
    // Long-tail
    "how to register as wedding vendor",
    "become a wedding vendor",
    "wedding vendor registration process",
    "vendor registration india free",
    "online vendor registration",
    
    // Local + category
    "photography vendor registration in delhi",
    "catering vendor in mumbai",
    "wedding vendor registration in bangalore",
    
    // Partnership keywords
    "wedding vendor partnership",
    "vendor partner program",
    "become a gomandap vendor",
    "join gomandap as vendor"
  ],
  
  // Benefits messaging (FREE emphasis)
  BENEFITS: [
    "100% FREE Registration",
    "Zero Subscription Fees",
    "Zero Commission on First 50 Bookings",
    "Access to 10,000+ Customers",
    "Easy Booking Management",
    "Professional Portfolio Showcase",
    "24/7 Vendor Support",
    "Instant Payment Processing",
    "No Hidden Costs"
  ]
};

// Cross-Domain Configuration
export const CROSS_DOMAIN_CONFIG = {
  // Main domains
  MAIN_SITE: "https://gomandap.com",
  VENDOR_SITE: "https://vendor.gomandap.com",
  
  // Links to add on main site footer
  FOOTER_LINKS: [
    { text: "Register as Vendor", url: "https://vendor.gomandap.com", title: "Become a Wedding Vendor - FREE Registration" },
    { text: "Vendor Portal", url: "https://vendor.gomandap.com", title: "Vendor Management Dashboard" },
    { text: "Partner with Us", url: "https://vendor.gomandap.com", title: "Join Our Vendor Community" }
  ],
  
  // Category landing page links
  CATEGORY_VENDOR_LINKS: {
    "photography-videography": "https://vendor.gomandap.com/onboarding/photography-videography",
    "catering": "https://vendor.gomandap.com/onboarding/catering",
    "banquet-halls": "https://vendor.gomandap.com/onboarding/banquet-halls",
    "makeup-artists": "https://vendor.gomandap.com/onboarding/makeup-artists",
    "dj-sound-systems": "https://vendor.gomandap.com/onboarding/dj-sound-systems",
    "decor-planners": "https://vendor.gomandap.com/onboarding/decor-planners",
    "jewelry": "https://vendor.gomandap.com/onboarding/jewelry",
    "transportation": "https://vendor.gomandap.com/onboarding/transportation"
  }
};

// Schema.org Structured Data for Google
export const SCHEMA_CONFIG = {
  // Organization schema (same on both domains)
  ORGANIZATION: {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Gomandap",
    "url": "https://gomandap.com",
    "logo": "https://gomandap.com/logo.svg",
    "sameAs": [
      "https://vendor.gomandap.com",
      "https://www.facebook.com/gomandap",
      "https://www.instagram.com/gomandap",
      "https://www.linkedin.com/company/gomandap"
    ],
    "description": "India's premier event vendor marketplace. Find wedding vendors or register as a vendor - 100% FREE.",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "email": "support@gomandap.com"
    }
  },

  // Registration Action Schema (for vendor site)
  REGISTRATION_ACTION: {
    "@context": "https://schema.org",
    "@type": "RegisterAction",
    "name": "Vendor Registration",
    "description": "Free vendor registration for wedding service providers",
    "url": "https://vendor.gomandap.com/onboarding",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://vendor.gomandap.com/onboarding/{category}",
      "actionPlatform": ["DesktopWebPlatform", "MobileWebPlatform"]
    }
  },

  // LocalBusiness Schema (for category pages)
  LOCAL_BUSINESS_TEMPLATE: {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://vendor.gomandap.com",
    "name": "Gomandap Vendor {CATEGORY}",
    "description": "Register as a {CATEGORY} vendor on Gomandap - 100% FREE registration with zero commission on first 50 bookings",
    "url": "https://vendor.gomandap.com/onboarding/{CATEGORY_SLUG}",
    "areaServed": "IN",
    "serviceType": "{CATEGORY}",
    "priceRange": "₹",
    "image": "https://vendor.gomandap.com/og-{CATEGORY_SLUG}.jpg"
  }
};

// Meta Tags for Google
export const META_TAGS_CONFIG = {
  // Main vendor site meta tags
  VENDOR_HOME: {
    title: "Vendor Registration - Gomandap | FREE Wedding Vendor Portal | Zero Commission",
    description: "Register as a wedding vendor on Gomandap - 100% FREE. Get access to 10,000+ customers. Zero commission on first 50 bookings. Join 1000+ vendors earning more.",
    keywords: "vendor registration free, wedding vendor registration, become a vendor, zero commission vendor"
  },

  // Category pages template
  CATEGORY_PAGE_TEMPLATE: {
    title: "Register as {CATEGORY} Vendor on Gomandap | FREE Partnership",
    description: "Join Gomandap as a {CATEGORY} vendor - 100% FREE. Get access to 10,000+ customers. Zero commission on first 50 bookings. Start earning today.",
    keywords: "{CATEGORY} vendor registration, free {CATEGORY} vendor portal, register as {CATEGORY}"
  },

  // Main site meta tags (gomandap.com)
  MAIN_SITE_HOME: {
    title: "Gomandap - Find Wedding Vendors | Photography, Catering, Venues | Trusted by Thousands",
    description: "Find 10,000+ verified wedding vendors on Gomandap. Book photographers, caterers, venues, decorators, and more. Transparent pricing. Instant booking. Register as vendor - FREE.",
    keywords: "wedding vendors, wedding photographer, wedding catering, wedding venue, wedding services"
  }
};

// Google Search Console Recommendations
export const GSC_SETUP = {
  VERIFICATION_METHODS: [
    "Add HTML file to /public/google-verification.html",
    "Add DNS record (CNAME or TXT)",
    "Add Google Analytics property verification"
  ],

  SITEMAP_SUBMISSION: [
    {
      domain: "vendor.gomandap.com",
      sitemap: "https://vendor.gomandap.com/sitemap.xml",
      priority: "HIGH"
    },
    {
      domain: "gomandap.com",
      sitemap: "https://gomandap.com/sitemap.xml",
      priority: "HIGH"
    }
  ],

  PROPERTIES_TO_SETUP: [
    "vendor.gomandap.com (with www and without)",
    "gomandap.com (with www and without)"
  ],

  MANUAL_ACTIONS_TO_CHECK: [
    "No manual actions on vendor portal",
    "No spam signals detected",
    "All category pages indexed"
  ],

  COVERAGE_REPORT_TARGETS: [
    "All 10+ category pages indexed",
    "No 'excluded' pages on vendor site",
    "All internal links crawlable"
  ]
};

// Implementation Checklist
export const IMPLEMENTATION_CHECKLIST = {
  VENDOR_SITE: [
    { done: true, task: "✓ Create robots.txt allowing crawling", file: "vendor/public/robots.txt" },
    { done: true, task: "✓ Create sitemap.xml with all category URLs", file: "vendor/public/sitemap.xml" },
    { done: true, task: "✓ Update DynamicSEO component with default meta tags", file: "vendor/src/components/DynamicSEO.jsx" },
    { done: true, task: "✓ Create CategoryOnboarding component with SEO", file: "vendor/src/pages/vendor/CategoryOnboarding.jsx" },
    { done: true, task: "✓ Add cross-domain meta tags and Schema", file: "vendor/src/components/DynamicSEO.jsx" },
    { done: true, task: "✓ Add FREE messaging to landing page", file: "vendor/src/pages/vendor/VendorLandingPage.jsx" },
    { done: false, task: "[ ] Submit sitemap to Google Search Console", file: "Google Search Console" },
    { done: false, task: "[ ] Verify vendor.gomandap.com domain in GSC", file: "Google Search Console" },
    { done: false, task: "[ ] Create Google Analytics tracking", file: "vendor/src/main.jsx" },
    { done: false, task: "[ ] Create robots.txt file for crawling", file: "vendor/public/robots.txt" }
  ],

  MAIN_SITE: [
    { done: false, task: "[ ] Update Footer with vendor site links", file: "client/src/components/layout/Footer.jsx" },
    { done: false, task: "[ ] Add vendor registration CTA on category pages", file: "client/src/pages/SearchPage.jsx" },
    { done: false, task: "[ ] Create robots.txt", file: "client/public/robots.txt" },
    { done: false, task: "[ ] Update sitemap.xml with vendor portal link", file: "client/public/sitemap.xml" },
    { done: false, task: "[ ] Add cross-domain Schema markup", file: "client/src/components/DynamicSEO.jsx" },
    { done: false, task: "[ ] Verify gomandap.com domain in GSC", file: "Google Search Console" },
    { done: false, task: "[ ] Submit sitemap to Google Search Console", file: "Google Search Console" },
    { done: false, task: "[ ] Setup cross-domain analytics tracking", file: "client/src/main.jsx" }
  ],

  GOOGLE_SEARCH_CONSOLE: [
    { done: false, task: "[ ] Add vendor.gomandap.com property", file: "GSC" },
    { done: false, task: "[ ] Add gomandap.com property", file: "GSC" },
    { done: false, task: "[ ] Verify ownership (HTML file or DNS)", file: "GSC" },
    { done: false, task: "[ ] Submit vendor sitemap", file: "GSC" },
    { done: false, task: "[ ] Submit main site sitemap", file: "GSC" },
    { done: false, task: "[ ] Check indexing status", file: "GSC" },
    { done: false, task: "[ ] Monitor search impressions & clicks", file: "GSC" },
    { done: false, task: "[ ] Check for crawl errors", file: "GSC" }
  ]
};

// Google-specific instructions
export const GOOGLE_INSTRUCTIONS = {
  TELL_GOOGLE: "By submitting sitemaps and verifying domains in Google Search Console, you are explicitly telling Google to crawl and index both vendor.gomandap.com and gomandap.com",
  
  SEO_BEST_PRACTICES: [
    "✓ Both domains have unique, relevant content",
    "✓ Meta tags emphasize FREE registration",
    "✓ Schema markup helps Google understand vendor registration service",
    "✓ Cross-domain linking shows relationship between sites",
    "✓ Keywords target both customer and vendor search intents",
    "✓ All pages are mobile-responsive",
    "✓ Sitemap includes all category pages"
  ],

  EXPECTED_RESULTS: [
    "vendor.gomandap.com ranked #1-5 for 'vendor registration free'",
    "Category pages ranked for 'register as [category] vendor'",
    "gomandap.com and vendor.gomandap.com both appear in SERPs for related queries",
    "Organic traffic to vendor site from Google Search",
    "Vendor registration conversions from organic search",
    "Both domains indexed and crawled regularly by Google"
  ]
};

// Google Analytics Events to Track
export const ANALYTICS_EVENTS = {
  CROSS_DOMAIN_LINK_CLICK: "cross_domain_link_click",
  VENDOR_REGISTRATION_START: "vendor_registration_start",
  VENDOR_REGISTRATION_COMPLETE: "vendor_registration_complete",
  CATEGORY_PAGE_VIEW: "category_page_view",
  VENDOR_LANDING_VIEW: "vendor_landing_view"
};

export default {
  SEO_MESSAGES,
  CROSS_DOMAIN_CONFIG,
  SCHEMA_CONFIG,
  META_TAGS_CONFIG,
  GSC_SETUP,
  IMPLEMENTATION_CHECKLIST,
  GOOGLE_INSTRUCTIONS,
  ANALYTICS_EVENTS
};
