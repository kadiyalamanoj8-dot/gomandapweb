# Gomandap Vendor App - Exhaustive Documentation

## 1. Introduction
The Vendor App is an independent, single-page application built with React 19, specifically tailored for B2B interactions. It provides event professionals (venue owners, decorators, photographers) with a secure platform to create detailed profiles, upload portfolios, and manage their business presence on Gomandap.

## 2. Bootstrapping & Intro Animation
1. **`main.jsx`**: The Vite entry point. Wraps the app in `SettingsContext` and `VendorContext`.
2. **`App.jsx`**: Defines routing. It mounts the `IntroScreen.jsx` which displays the Gomandap logo animation via Framer Motion, which relies on `window.addEventListener('deviceorientation', handleOrientation)` for an interactive gyroscope-based 3D logo reveal.
3. **Routing Flow**:
   - `/` -> `VendorLandingPage.jsx` (Phone Auth login)
   - `/onboarding` -> `VendorOnboarding.jsx` (The adaptive 6-step form)
   - `/pending` -> `VendorPending.jsx` (Post-submission review state)
   - `/dashboard` -> `VendorDashboard.jsx` (Approved vendor management)

## 3. Directory & Component Breakdown

### 3.1. Pages (`/src/pages/vendor/`)
- **`VendorLandingPage.jsx`**: The gateway. Highlights the benefits of joining Gomandap. Includes the phone/OTP login system. Once authenticated, the backend decides to route them to `/onboarding` (if new) or `/dashboard` (if approved).
- **`VendorOnboarding.jsx`**: The crown jewel of Gomandap's B2B interface. A massive, 6-step interactive wizard that adapts heavily based on the `categorySchemas.js`:
  - **Step 1 (Category):** Vendor selects from Gomandap's massive list: Banquet Halls, Photographers, Makeup Artists, Mehndi Designers, Boutiques, Astrologers, etc.
  - **Step 2 (Identity):** Basic details, GSTIN, location. Uses the `LocationPicker` Leaflet map.
  - **Step 3 (Services - THE DYNAMIC ENGINE):** This step completely changes based on Step 1. 
    - If a **Banquet Hall** is selected, the form requests `capacity` (e.g. 500 guests), `rooms`, `parking`, `ac` (Air Conditioning), and boolean toggles for `inHouseCatering`, `inHousePhotography`, etc.
    - If **Photography & Videography** is selected, it asks for `teamSize`, `deliveryTime`, and `drone` availability.
    - If **Makeup Artists (MUA)** is selected, it dynamically provides packages for Bridal vs Party makeup, and Airbrush techniques.
  - **Step 4 (Banking):** Secure collection of IFSC and Account data.
  - **Step 5 (Portfolio):** Image uploads handled via FormData direct to Cloudinary.
  - **Step 6 (Review):** Final submission.
  - *Performance Optimization:* Because of the huge number of fields, `LazyInput` is used to debounce keystrokes, ensuring typing "500 capacity" doesn't freeze the DOM. `saveDraft` aggressively patches to the backend.
- **`VendorPending.jsx`**: A beautiful waiting screen showing the status of the admin review. If rejected with feedback, it highlights the errors here.
- **`VendorDashboard.jsx`**: The authenticated portal where approved vendors view metrics, update availability, and manage inquiries. Wrapped in `React.memo` to prevent unnecessary re-renders.

### 3.2. Components (`/src/components/`)
- **`common/LazyInput.jsx`**: A critical performance component. It holds local state for inputs and only bubbles the `onChange` event to the parent component `onBlur` (or when typing stops). This prevents the entire `VendorOnboarding` tree from re-rendering on every keystroke.
- **`layout/Footer.jsx`**: Vendor-specific footer.
- **`IntroScreen.jsx` & `Preloader.jsx`**: Initial loading sequences (mostly bypassed in production for speed).
- **`DynamicSEO.jsx`**: Injects title tags for vendor-specific routes.

### 3.3. Contexts (`/src/context/`)
- **`VendorContext.jsx`**: The lifeblood of the app. It holds the `vendorProfile` state, the JWT token, and exposes methods like `submitOnboarding`, `saveDraft`, and `syncVendorAuth`. It uses `axios` to communicate with the `/api/vendors/` backend routes.
- **`SettingsContext.jsx`**: Used to determine if the vendor's chosen category has been temporarily disabled by the admin.

## 4. Data Flow Architecture (Onboarding)
1. Vendor logs in via phone number on `VendorLandingPage.jsx`.
2. `/api/vendors/auth/sync` is called. Backend returns `action: 'onboard'` and creates a draft document in MongoDB.
3. Vendor is pushed to `VendorOnboarding.jsx`.
4. As the vendor navigates between Step 1 and Step 6, the `performSaveDraft` function triggers an API call to `PATCH /api/vendors/draft/:id`.
5. Uploaded images (Step 5) are attached as `multipart/form-data`. The backend `multer-storage-cloudinary` middleware intercepts these, uploads to Cloudinary, and saves the secure URLs to MongoDB.
6. On Step 6 submit, the status changes to `pending`. Admin reviews the profile.
7. Upon approval, the vendor accesses `VendorDashboard.jsx` seamlessly.
