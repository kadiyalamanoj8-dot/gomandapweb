# Gomandap Admin App - Exhaustive Documentation

## 1. Introduction
The Admin App is a restricted, secure portal used by Gomandap personnel to manage the entire platform. It handles vendor approvals, global platform settings, dynamic schema generation, and geographical analytics.

## 2. Bootstrapping (Start to Finish Flow)
1. **`main.jsx`**: Wraps the application in the `AdminAuthContext`, strictly protecting all routes.
2. **`App.jsx`**: Defines routing. Unauthenticated users are forced to `/login`.
3. **Routing Flow**:
   - `/login` -> `AdminLogin.jsx`
   - `/` -> `AdminDashboard.jsx` (Vendor approvals)
   - `/settings` -> `CategorySettings.jsx` (Global platform toggles)
   - `/content` -> `ContentManager.jsx` (Dynamic schema builder)

## 3. Directory & Component Breakdown

### 3.1. Pages (`/src/pages/`)
- **`AdminLogin.jsx`**: Secure login gateway. Issues an Admin JWT token upon successful authentication.
- **`AdminDashboard.jsx`**: The primary workspace. 
  - Fetches all vendors via `getAllVendors` (cached instantly by the backend).
  - Displays a tabular list of vendors sorted by status (`pending`, `approved`, `rejected`).
  - Clicking a vendor opens the `VendorDetailsModal.jsx`.
- **`CategorySettings.jsx`**: Allows admins to toggle entire business categories on or off across the platform. Disabling a category instantly hides it from the Client App and prevents new Vendor Onboardings for that category.
- **`ContentManager.jsx`**: A powerful dynamic form builder specific to Gomandap's diverse vendor base. Admins can define custom "Deep Features" (e.g., creating a new "Has Swimming Pool?" Radio button for 'Resorts & Destination Venues', or a 'Drone Available?' toggle for 'Photography & Videography'). This schema is saved to the backend and instantly renders in the `VendorOnboarding` app (for data collection) and the `FilterSidebar` on the Client app (for searching) without deploying new code.

### 3.2. Components (`/src/components/`)
- **`Sidebar.jsx`**: The persistent left-hand navigation pane for routing between Dashboard, Content, and Settings.
- **`VendorDetailsModal.jsx`**: A massive overlay that displays 100% of the vendor's submitted data. 
  - Admins can review uploaded Cloudinary images, banking details, and location data.
  - Contains actions to "Approve" or "Reject with Feedback".
- **`LocationMapAdmin.jsx`**: A `react-leaflet` map implementation that plots all vendor coordinates. Used for geographical analytics to see where business density is highest.

### 3.3. Contexts (`/src/context/`)
- **`AdminAuthContext.jsx`**: Stores the admin JWT token in `localStorage` and attaches it as an `Authorization: Bearer <token>` header to all outgoing `axios` requests to protected `/api/vendors/admin/*` routes.

## 4. Data Flow Architecture (Approval Process)
1. Admin logs into `AdminLogin.jsx`.
2. Admin navigates to `AdminDashboard.jsx`. A request is sent to `GET /api/vendors/admin/all`.
3. The backend responds instantly (via `node-cache` if warmed) with the entire vendor database.
4. Admin clicks a 'pending' vendor, opening `VendorDetailsModal.jsx`.
5. Admin clicks "Approve". A `PATCH` request is sent to `/api/vendors/:id/status` with payload `{ status: 'approved' }`.
6. The backend updates MongoDB, flushes the global `node-cache`, and responds with success.
7. The Admin Dashboard updates optimistically to show the vendor as approved. The vendor is now live on the Client App instantly.
