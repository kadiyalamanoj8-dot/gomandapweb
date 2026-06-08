# Cross-Domain SEO Configuration

## GOMANDAP & VENDOR.GOMANDAP.COM LINKING STRATEGY

### Objective
Make both **gomandap.com** (customer-facing) and **vendor.gomandap.com** (vendor-facing) appear together in Google Search Results for relevant queries.

---

## 1. CROSS-DOMAIN LINKING STRUCTURE

### From Main Site (gomandap.com) → Vendor Site (vendor.gomandap.com)

#### Navigation Links
```html
<!-- In client/src/components/layout/Navbar.jsx -->
<a href="https://vendor.gomandap.com" rel="noopener noreferrer">
  Register as Vendor
</a>

<!-- In client/src/components/layout/Footer.jsx -->
<div className="footer-section">
  <h4>For Vendors</h4>
  <a href="https://vendor.gomandap.com">Vendor Portal</a>
  <a href="https://vendor.gomandap.com/onboarding/photography-videography">Photography Vendor</a>
  <a href="https://vendor.gomandap.com/onboarding/catering">Catering Vendor</a>
  <!-- ... all categories -->
</div>
```

#### Category Search Pages
```html
<!-- In client/src/pages/SearchPage.jsx -->
<!-- Add link below filters or search results -->
<div className="vendor-registration-cta">
  <h4>Become a {categoryName} Vendor</h4>
  <p>Join Gomandap's community of {categoryName} vendors</p>
  <a href={`https://vendor.gomandap.com/onboarding/${categorySlug}`}>
    Register Now
  </a>
</div>
```

### From Vendor Site (vendor.gomandap.com) → Main Site (gomandap.com)

#### Navigation Links
```html
<!-- In vendor/src/components/layout/Footer.jsx -->
<a href="https://gomandap.com" rel="noopener noreferrer">
  Browse Vendors
</a>
<a href="https://gomandap.com/search" rel="noopener noreferrer">
  Find Services
</a>
```

---

## 2. STRUCTURED DATA FOR CROSS-SITE LINKING

### Organization Schema (Unified Across Both Domains)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Gomandap",
  "url": "https://gomandap.com",
  "sameAs": [
    "https://vendor.gomandap.com",
    "https://www.facebook.com/gomandap",
    "https://www.instagram.com/gomandap"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91-XXXXXXXXXX",
    "contactType": "Customer Service"
  }
}
```

### BreadcrumbList Schema (Vendor Site)

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Gomandap",
      "item": "https://gomandap.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Vendor Portal",
      "item": "https://vendor.gomandap.com"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Photography Vendor Registration",
      "item": "https://vendor.gomandap.com/onboarding/photography-videography"
    }
  ]
}
```

---

## 3. META TAGS FOR SEARCH ENGINE DISCOVERY

### Main Site Meta Tags (gomandap.com)
```html
<!-- In client/src/index.html or main SEO component -->
<title>Gomandap - Find Wedding Vendors | Photography, Catering, Venues, More</title>
<meta name="description" content="Find 10,000+ verified wedding vendors on Gomandap. Search venues, photographers, caterers, decorators, and more. Book instantly. Trusted by couples across India.">
<link rel="alternate" href="https://vendor.gomandap.com" />
```

### Vendor Site Meta Tags (vendor.gomandap.com)
```html
<!-- In vendor/public/index.html -->
<title>Vendor Registration - Gomandap | FREE Wedding Vendor Portal</title>
<meta name="description" content="Register as a wedding vendor on Gomandap - 100% FREE. Get access to 10,000+ customers. Zero commission on first 50 bookings. All vendor categories.">
<link rel="alternate" href="https://gomandap.com" />
```

---

## 4. ROBOTS.TXT & CRAWLABILITY

### gomandap.com/robots.txt
```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /dashboard
Sitemap: https://gomandap.com/sitemap.xml

# Tell Google about vendor portal
User-agent: Googlebot
Allow: /
```

### vendor.gomandap.com/robots.txt
```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /dashboard
Sitemap: https://vendor.gomandap.com/sitemap.xml

# Tell Google about main portal
User-agent: Googlebot
Allow: /
```

---

## 5. SITEMAPS

### Main Sitemap (gomandap.com/sitemap.xml)
```xml
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://gomandap.com/</loc>
    <priority>1.0</priority>
  </url>
  
  <!-- Link to vendor portal -->
  <url>
    <loc>https://vendor.gomandap.com/</loc>
    <priority>0.9</priority>
  </url>
  
  <!-- Category pages link to vendor registration -->
  <url>
    <loc>https://gomandap.com/search/photography-videography</loc>
    <priority>0.8</priority>
    <!-- Internal annotation to vendor portal -->
  </url>
</urlset>
```

### Vendor Sitemap (vendor.gomandap.com/sitemap.xml)
```xml
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://vendor.gomandap.com/</loc>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://vendor.gomandap.com/onboarding</loc>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://vendor.gomandap.com/onboarding/photography-videography</loc>
    <priority>0.8</priority>
  </url>
  <!-- All category pages -->
</urlset>
```

---

## 6. OPEN GRAPH & SOCIAL SHARING

### Main Site OG Tags (gomandap.com)
```html
<meta property="og:title" content="Gomandap - Find & Book Wedding Vendors">
<meta property="og:description" content="10,000+ verified wedding vendors. Photography, venues, catering, decor, and more.">
<meta property="og:image" content="https://gomandap.com/og-main.jpg">
<meta property="og:url" content="https://gomandap.com">
<meta property="og:type" content="website">

<!-- Link to vendor site in content -->
<meta property="og:article:author" content="https://vendor.gomandap.com">
```

### Vendor Site OG Tags (vendor.gomandap.com)
```html
<meta property="og:title" content="Vendor Registration - Gomandap | Join 1000+ Vendors">
<meta property="og:description" content="Register as a wedding vendor - 100% FREE. Zero commission on first 50 bookings.">
<meta property="og:image" content="https://vendor.gomandap.com/og-vendor.jpg">
<meta property="og:url" content="https://vendor.gomandap.com">

<!-- Link to main site -->
<meta property="og:see_also" content="https://gomandap.com">
```

---

## 7. GOOGLE SEARCH CONSOLE SETUP

### Actions to Perform in GSC

1. **Verify Both Domains**
   - Add verification for gomandap.com
   - Add verification for vendor.gomandap.com
   - Add all sitemaps

2. **Setup URL Parameters** (if using query params)
   - Define parameters for filters
   - Set crawl budget preferences

3. **Submit Sitemaps**
   - gomandap.com/sitemap.xml
   - vendor.gomandap.com/sitemap.xml

4. **Check Index Status**
   - Verify all pages are indexed
   - Check for crawl errors
   - Fix any "not found" or "excluded" pages

5. **Setup Linking**
   - Verify cross-domain links are recognized
   - Use GSC to view internal links between domains

---

## 8. KEYWORD TARGETING STRATEGY

### Main Site (gomandap.com) Keywords
```
- "Find wedding vendors [city]"
- "Best wedding photographers [city]"
- "Wedding catering services [city]"
- "Wedding venue [city]"
- "Book wedding services [city]"
- "Hire wedding vendors [city]"
```

### Vendor Site (vendor.gomandap.com) Keywords
```
- "Register as wedding vendor"
- "Vendor registration free"
- "Become a photography vendor"
- "Wedding vendor portal"
- "Vendor partnership program"
- "Register photography business online"
- "Free vendor registration [service] [city]"
```

### Branded Keywords (Both Sites)
```
- "Gomandap vendors"
- "Gomandap vendor registration"
- "Gomandap partner program"
- "Gomandap vendor portal"
```

---

## 9. TECHNICAL IMPLEMENTATION CHECKLIST

### gomandap.com (Client App)
- [ ] Update Footer with vendor site links
- [ ] Add vendor registration CTA on category pages
- [ ] Update meta tags with vendor portal reference
- [ ] Add Organization Schema linking both domains
- [ ] Update robots.txt
- [ ] Create/update sitemap.xml
- [ ] Submit sitemap to GSC
- [ ] Verify domain in GSC

### vendor.gomandap.com (Vendor App)
- [ ] Add cross-domain links in navigation
- [ ] Update DynamicSEO component with Schema
- [ ] Create robots.txt allowing indexing
- [ ] Create sitemap.xml with all category URLs
- [ ] Add Open Graph tags
- [ ] Submit sitemap to GSC
- [ ] Verify domain in GSC
- [ ] Test cross-domain linking

---

## 10. MONITORING & ANALYTICS

### Google Search Console Queries
1. Monitor search queries for:
   - "register as [category] vendor"
   - "vendor registration free"
   - "become a [category] partner"

2. Track impressions & clicks:
   - Which vendor category pages get most impressions
   - Which keywords drive conversions
   - CTR for vendor registration pages

### Google Analytics Tracking
```javascript
// Cross-domain tracking
ga('create', 'UA-XXXXX-1', 'auto', {'allowLinker': true});
ga('require', 'linker');
ga('linker:autoLink', ['gomandap.com', 'vendor.gomandap.com']);

// Track vendor registration clicks
gtag('event', 'click_vendor_registration', {
  'link_url': 'https://vendor.gomandap.com/onboarding/[category]',
  'link_text': 'Register as Vendor'
});
```

---

## 11. SEARCH RESULT APPEARANCE

### Expected SERP Appearance
**Main Site:**
- Title: "Gomandap - Find Wedding Vendors | Photography, Catering, Venues"
- URL: gomandap.com
- Meta: "10,000+ verified wedding vendors..."
- Rich snippet: Vendor count, top categories

**Vendor Site:**
- Title: "Vendor Registration - Gomandap | Free Wedding Vendor Portal"
- URL: vendor.gomandap.com/onboarding/[category]
- Meta: "Register as [category] vendor - 100% FREE..."
- Rich snippet: Free registration badge, FAQPage

### Target SERP Results
When user searches: "Register as photography vendor in India"
- Result 1: vendor.gomandap.com/onboarding/photography-videography (Primary)
- Result 2: gomandap.com (Secondary - supports the vendor site)

---

## 12. IMPLEMENTATION PRIORITY

**Phase 1 (Week 1):**
- [ ] Create robots.txt for both domains
- [ ] Update DynamicSEO component
- [ ] Create sitemap.xml for vendor site
- [ ] Add cross-domain meta tags

**Phase 2 (Week 2):**
- [ ] Add internal links on main site
- [ ] Update footer with vendor links
- [ ] Create CategoryOnboarding pages
- [ ] Add Schema markup

**Phase 3 (Week 3):**
- [ ] Submit sitemaps to GSC
- [ ] Verify both domains in GSC
- [ ] Monitor indexing status
- [ ] Track search impressions

**Phase 4 (Week 4+):**
- [ ] Monitor rankings
- [ ] Optimize CTR based on SERP data
- [ ] Build quality backlinks
- [ ] Track vendor registration conversions
