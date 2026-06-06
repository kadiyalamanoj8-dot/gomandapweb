# Gomandap Client App - Exhaustive Documentation

## 1. Introduction
The Client App is the primary, public-facing portal built with React 19 and Vite. Its primary goal is to help users seamlessly discover, filter, and review event venues and vendors across India. It is highly optimized for performance, utilizing complex `framer-motion` animations, `node-cache` integration via the backend, and optimistic UI rendering.

## 2. Bootstrapping (Start to Finish Flow)
1. **`main.jsx`**: The entry point. It wraps the entire application in global providers (`HelmetProvider` for SEO, Google OAuth provider, `AuthProvider`, `SettingsContext`, `CartContext`, and `VendorContext`).
2. **`App.jsx`**: Houses the `react-router-dom` definitions. It defines the layout wrapper (which includes the `SpatialNavbar`, `MobileBottomNav`, `CartDrawer`, and `Footer`).
3. **Routing Flow**:
   - `/` -> `HomePage.jsx`
   - `/search` -> `SearchPage.jsx`
   - `/vendor/:id` -> `VendorDetailsPage.jsx`
   - `/profile` -> `ProfilePage.jsx`

## 3. Directory & Component Breakdown

### 3.1. Pages (`/src/pages/`)
- **`HomePage.jsx`**: The landing page. It orchestrates the `HeroParallax`, `SwipeableCategorySlider`, `VisualCategoryGrid`, and `FeaturedVendors` carousels. It mounts with a `-mt-[72px]` margin to merge perfectly with the transparent spatial navbar.
- **`SearchPage.jsx`**: The core discovery engine for Gomandap. It reads URL parameters specifically injected for Gomandap's backend, such as `category` (e.g., "Banquet Halls", "Resorts & Destination Venues"), `lat`, `lng`, and Gomandap's unique `dynamic_*` deep features (like `dynamic_ac=Fully AC`, `dynamic_drone=Yes`). It fetches data from the backend and renders `LiquidVendorCard`s. It includes the `FilterSidebar` for runtime query modifications.
- **`VendorDetailsPage.jsx`**: Renders an immersive profile for a selected vendor. It displays large portfolio carousels, pricing packages, dynamic deep features, and a map view of the venue/business location.
- **`ProfilePage.jsx`**: User profile management (saves, favorites, past inquiries).
- **`vendor/*` (Legacy)**: Some vendor onboarding components (`VendorDashboard`, `VendorOnboarding`) initially lived here before being split into the standalone Vendor App.

### 3.2. Home Components (`/src/components/home/`)
- **`HeroParallax.jsx`**: The star of the Gomandap homepage. It replaces standard hero images with a 3-layer 3D temple and couple asset structure. It uses `framer-motion` springs tied to mouse movement on desktop and mobile device orientation (gyroscope). The gyro logic is highly tuned specifically for Gomandap (X-axis divisor 240 to stop wobble, Y-axis divisor 30 to enhance vertical tilt) for a premium depth-of-field experience. Includes the main search bar containing Gomandap's specific Event Types (Pelli, Sangeet, Cradle Ceremony).
- **`SwipeableCategorySlider.jsx` & `VisualCategoryGrid.jsx`**: Renders Gomandap's categories (Banquet Halls, Photographers, Makeup Artists, Astrologers, Honeymoon Packages) using custom 3D webp assets (e.g., `/images/3d_venue.webp`, `/images/3d_astrologer.webp`).
- **`FeaturedVendors.jsx` & `VendorCarousel.jsx`**: Horizontally scrolling lists of high-rated vendors fetched from the backend.

### 3.3. Layout Components (`/src/components/layout/`)
- **`SpatialNavbar.jsx`**: A glassmorphic, sticky top navigation bar that transitions from transparent to solid white upon scrolling.
- **`MobileBottomNav.jsx` & `BottomNav.jsx`**: iOS-style floating bottom navigation for mobile users, allowing quick access to Home, Search, Saved, and Profile.
- **`CartDrawer.jsx`**: An interactive slide-out drawer utilizing `framer-motion` for users to keep track of vendors they plan to inquire with.
- **`Footer.jsx`**: Standard SEO-friendly footer with links.

### 3.4. Search & UI Components (`/src/components/search/` & `/src/components/ui/`)
- **`FilterSidebar.jsx`**: A complex, sticky sidebar that reads Gomandap's dynamic filter schemas (found in `categorySchemas.js`). For example, if searching Banquet Halls, it renders filters for "Air Conditioning" and "Parking Capacity". If searching Photographers, it renders "Drone Available?". It translates user checkboxes into URL parameters (`&dynamic_drone=Yes`), communicating directly with Gomandap's backend dynamic query engine.
- **`LiquidVendorCard.jsx` (`/common/`)**: A highly polished, reusable card component used in lists and carousels. Features image preloading, heart-toggle animations, and price rendering.
- **`CustomDropdown.jsx`**: A bespoke dropdown menu used for sorting options.

### 3.5. Contexts (`/src/context/`)
- **`AuthContext.jsx`**: Manages user login state via Firebase/Google and handles JWT tokens.
- **`CartContext.jsx`**: Maintains a volatile or persisted list of vendors the user wishes to contact.
- **`SettingsContext.jsx`**: Connects to the backend to check which categories are currently active/enabled by the admin, dynamically hiding disabled categories from the UI.
- **`VendorContext.jsx`**: Handles context for vendor-specific state if accessed from the client (legacy hybrid support).

## 4. Data Flow Architecture
1. User modifies a filter in `FilterSidebar.jsx`.
2. Component pushes a `dynamic_` URL param to `react-router-dom`'s `useSearchParams`.
3. `SearchPage.jsx` detects the URL change via `useEffect`.
4. `SearchPage.jsx` parses all `dynamic_` keys and constructs a fetch request to `https://gomandap-api.onrender.com/api/vendors`.
5. Backend responds (usually instantly via `node-cache`).
6. `SearchPage.jsx` maps the data using `useMemo` into `LiquidVendorCard` components, ensuring 60fps scrolling without re-renders.
