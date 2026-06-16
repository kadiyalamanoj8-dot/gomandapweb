# 🔍 Admin Full Feature Audit Report
> Last checked: June 2026 | Server: Oracle Cloud VM → Cloudflare → api.gomandap.com

---

## ✅ Overall Status Summary

| Feature Page | Route | Backend API | Status |
|---|---|---|---|
| Dashboard — Vendors tab | `/vendors` | `GET /api/vendors/admin/all` | ✅ Working |
| Dashboard — Clients tab | `/vendors` | `GET /api/auth/users` | ✅ Working |
| Dashboard — Interventions tab | `/vendors` | `GET /api/bookings/admin` | ✅ Working |
| Dashboard — Security tab | `/vendors` | Local 2FA setup API | ✅ Working |
| Category Settings | `/category-settings` | `GET/PATCH /api/settings` | ✅ Working |
| Language Settings | `/language-settings` | `GET/PATCH /api/settings` | ✅ Working |
| Client Manager | `/clients` | `GET /api/auth/users` | ✅ Working |
| Client UI Settings | `/client-ui` | `GET /api/settings`, `PATCH /api/settings/client-ui` | ✅ Working |
| Footer Settings | `/footer-settings` | `GET /api/content`, `PATCH /api/content/footer` | ✅ Working |
| Leads CRM | `/leads` | `GET /api/leads` | ✅ Working (empty DB) |
| Marketing CRM | `/marketing` | `GET /api/marketing/contacts` | ✅ Working (empty DB) |
| WhatsApp Bot | `/whatsapp-bot` | `GET /api/whatsapp/status` | ⚠️ Running but not authenticated |
| Ad Manager | `/ad-manager` | ❌ No backend — local state only | ❌ Not connected |

---

## 🔴 Issues Found & What Needs To Be Done

### 1. Ad Manager — NOT Connected to Backend
**Page**: `/ad-manager`  
**Problem**: The save button uses `setTimeout()` — it's a fake save. No data is persisted. Nothing is stored in MongoDB.

**What needs to be done**:
- Create `backend/models/AdPackage.js` model
- Create `backend/routes/adRoutes.js` with `GET /api/ads/package` and `PATCH /api/ads/package`
- Connect the save button in `admin/src/pages/AdManager.jsx` to the real API
- Connect the vendor app to read the package pricing from the API

---

### 2. WhatsApp Bot — Not Authenticated
**Page**: `/whatsapp-bot`  
**Status**: `isReady: false` — WhatsApp session is not connected.

**What needs to be done**:
- Open `https://admin.gomandap.com/whatsapp-bot` on the deployed site
- Scan the QR code shown on the page with your WhatsApp phone
- Once scanned, the bot will be `isReady: true` and can send messages

> ⚠️ The QR code expires every 30-60 seconds. The VM WhatsApp session is stored at `whatsapp-auth/session/` and will survive server restarts once authenticated.

---

### 3. Marketing CRM — Email Sending Needs SMTP Config
**Page**: `/marketing`  
**Problem**: Sending emails via the "Email" button fails because `SMTP_USER` and `SMTP_PASS` are empty in the VM's `backend/.env`.

**What needs to be done**:
- SSH into the VM
- Edit `~/gomandapweb/backend/.env`
- Add your Gmail/SMTP credentials:
  ```
  SMTP_USER=yourmail@gmail.com
  SMTP_PASS=your_google_app_password
  ```
- Run `npx pm2 restart gomandap-backend`

> WhatsApp outreach works without SMTP — it opens `wa.me` links directly.

---

### 4. Leads CRM — Data Entry Needed
**Page**: `/leads`  
**Status**: Working but empty — no leads exist in the database yet.

**What needs to be done**:
- Leads are created from the **client app** (`gomandap.com`) when users submit inquiries
- No action needed in the admin — leads will appear automatically once the client app is in use

---

### 5. Footer Settings — Client & Vendor Apps Must Use the API
**Page**: `/footer-settings`  
**Status**: Save works, but the **client and vendor apps** must fetch from `GET /api/content` to display the saved footer data.

**What needs to be done**:
- Verify `client/src` and `vendor/src` footer components call `GET /api/content` instead of using hardcoded text
- If they don't, update them to call the API on mount and render the dynamic values

---

## 📋 Backend API Reference (Confirmed Working)

### Vendors
| Method | Endpoint | Used By |
|--------|----------|---------|
| `GET` | `/api/vendors/admin/all` | Admin Dashboard |
| `PATCH` | `/api/vendors/:id/status` | Admin Approve/Reject |
| `PATCH` | `/api/vendors/:id/admin-settings` | Admin Vendor Settings |
| `GET` | `/api/vendors` | Client & Vendor App |

### Auth & Users
| Method | Endpoint | Used By |
|--------|----------|---------|
| `POST` | `/api/auth/admin/login` | Admin Login |
| `POST` | `/api/auth/admin/2fa/setup` | Security Tab |
| `POST` | `/api/auth/admin/2fa/verify` | Security Tab |
| `GET` | `/api/auth/users` | Admin Clients Tab |
| `POST` | `/api/auth/google` | Client App Login |

### Settings
| Method | Endpoint | Used By |
|--------|----------|---------|
| `GET` | `/api/settings` | Admin + Client + Vendor |
| `PATCH` | `/api/settings/categories/toggle` | Admin Category Settings |
| `PATCH` | `/api/settings/languages/toggle` | Admin Language Settings |
| `PATCH` | `/api/settings/client-ui` | Admin Client UI Settings |

### Content (Footer)
| Method | Endpoint | Used By |
|--------|----------|---------|
| `GET` | `/api/content` | Admin + Client + Vendor (footer) |
| `PATCH` | `/api/content/footer` | Admin Footer Settings |

### Bookings
| Method | Endpoint | Used By |
|--------|----------|---------|
| `GET` | `/api/bookings/admin` | Admin Interventions |
| `PATCH` | `/api/bookings/:id/admin` | Admin Intervention |
| `POST` | `/api/bookings` | Client App |
| `GET` | `/api/bookings/vendor/:vendorId` | Vendor App |
| `GET` | `/api/bookings/user/:userId` | Client App |

### Leads
| Method | Endpoint | Used By |
|--------|----------|---------|
| `GET` | `/api/leads` | Admin Leads CRM |

### Marketing
| Method | Endpoint | Used By |
|--------|----------|---------|
| `GET` | `/api/marketing/contacts` | Admin Marketing CRM |
| `POST` | `/api/marketing/contacts/import` | Admin (CSV/JSON upload) |
| `PUT` | `/api/marketing/contacts/:id/status` | Admin Marketing CRM |
| `POST` | `/api/marketing/email/send/:id` | Admin (requires SMTP) |

### WhatsApp
| Method | Endpoint | Used By |
|--------|----------|---------|
| `GET` | `/api/whatsapp/status` | Admin WhatsApp Bot |
| `POST` | `/api/whatsapp/send` | Admin WhatsApp Bot |

---

## 🟡 What Still Needs To Be Built

| Priority | Task |
|----------|------|
| 🔴 High | Connect Ad Manager to real backend (save to MongoDB) |
| 🔴 High | Scan WhatsApp QR code to authenticate the bot |
| 🟡 Medium | Add SMTP credentials to VM `.env` for email sending |
| 🟡 Medium | Verify client/vendor footer reads from `/api/content` |
| 🟢 Low | Add admin middleware to protect sensitive endpoints |
| 🟢 Low | Remove `111111` master override from auth controller |
| 🟢 Low | Add auto-deploy via GitHub Actions |
