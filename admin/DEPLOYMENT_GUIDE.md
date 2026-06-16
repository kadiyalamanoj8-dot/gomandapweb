# 🛡️ Gomandap Admin Panel — Deployment Guide

> **URL**: https://admin.gomandap.com  
> **Server**: Oracle Cloud VM — `68.233.97.93`  
> **Stack**: React + Vite → PM2 (`serve`) → Nginx → Cloudflare → Browser

---

## ✅ What Was Done (June 2026)

### 1. Admin Login Form Updated
The old login form had **username + password** fields.  
It was updated to use only a **TOTP 6-digit authenticator code** (more secure).

**File changed**: `admin/src/pages/AdminLogin.jsx`

---

### 2. `_redirects` File Added
Added `admin/public/_redirects` to fix React Router on Cloudflare/Nginx:
```
/*   /index.html   200
```
This prevents 404 errors when refreshing on any route other than `/`.

---

### 3. Nginx CORS Fix
The Nginx config at `/etc/nginx/conf.d/gomandap.conf` was updated so that the `api.gomandap.com` server block handles **CORS preflight** (`OPTIONS`) requests correctly.

**Before** — Nginx returned `405 Not Allowed` for all OPTIONS requests, blocking every browser API call.

**After** — Nginx returns `204 No Content` with proper CORS headers for OPTIONS, and proxies all other requests to the backend on port `5000`.

---

### 4. 2FA Re-synced on Production
The VM's MongoDB had a **different 2FA secret** than what was in the local dev database. The Microsoft Authenticator app was set up with the local secret, so every code failed on production.

**Fix applied**:
- Called `POST https://api.gomandap.com/api/auth/admin/2fa/setup` to generate a new secret
- Scanned the QR code in Microsoft Authenticator
- Called `POST https://api.gomandap.com/api/auth/admin/2fa/verify` to save the new secret to the VM's MongoDB

**The Microsoft Authenticator entry to use is**: `Gomandap Admin`

---

### 5. `.env.local` Deleted on VM
The VM had a leftover `.env.local` inside `admin/` with this line:
```
VITE_API_URL=http://68.233.97.93:5000
```
This **overrode** the correct `.env` and baked the raw IP into the production build.
Port 5000 is blocked by Oracle's firewall, so every API call failed.

**Fix**: Deleted `.env.local` on the VM. The correct `.env` now takes effect:
```
VITE_API_URL=https://api.gomandap.com
```

---

## 🚀 How to Deploy Updates to Admin

Every time you make changes to the admin panel, SSH into the VM and run:

```bash
# SSH into Oracle VM
ssh -i C:\Users\manoj\.ssh\id_rsa_oci opc@68.233.97.93

# Pull latest code
cd ~/gomandapweb
git pull origin main

# Rebuild admin
cd admin
npm install       # only needed if package.json changed
npm run build     # takes ~2 minutes

# Restart PM2 to serve new build
cd ..
npx pm2 restart gomandap-admin

# Verify all services are running
npx pm2 list
```

---

## 🔐 How to Log Into the Admin Panel

1. Go to **https://admin.gomandap.com**
2. Open **Microsoft Authenticator** on your phone
3. Tap the **Gomandap Admin** entry
4. Enter the **6-digit code** shown → click **Verify Code**

> ⚠️ Codes refresh every **30 seconds**. Enter it quickly.

---

## 🏗️ Architecture Overview

```
Browser (https://admin.gomandap.com)
    ↓ HTTPS
Cloudflare (DNS Proxy — Flexible SSL)
    ↓ HTTP port 80
Oracle VM Nginx (/etc/nginx/conf.d/gomandap.conf)
    ↓ proxy_pass
PM2 → serve (admin/dist/) on port 3002

Browser (https://api.gomandap.com)
    ↓ HTTPS
Cloudflare (DNS Proxy — Flexible SSL)
    ↓ HTTP port 80
Oracle VM Nginx (handles OPTIONS/CORS)
    ↓ proxy_pass
PM2 → gomandap-backend (backend/server.js) on port 5000
```

---

## 📋 PM2 Services on Oracle VM

| Name | Port | Description |
|------|------|-------------|
| `gomandap-backend` | 5000 | Node.js / Express API |
| `gomandap-client` | 3000 | Main client app |
| `gomandap-vendor` | 3001 | Vendor app |
| `gomandap-admin` | 3002 | Admin panel |

**Useful PM2 commands on VM:**
```bash
npx pm2 list                          # See all services
npx pm2 logs gomandap-admin           # View admin logs
npx pm2 logs gomandap-backend         # View backend logs
npx pm2 restart gomandap-backend      # Restart backend
npx pm2 restart all                   # Restart everything
```

---

## ⚠️ Important Rules — Never Break These

| Rule | Why |
|------|-----|
| Never create `.env.local` on the VM | It overrides `.env` and breaks the production API URL |
| Always use `https://api.gomandap.com` in production `.env` | Direct IP (`68.233.97.93:5000`) is blocked by Oracle firewall |
| Cloudflare SSL mode must stay **Flexible** | VM only has HTTP (port 80), not HTTPS (port 443) |
| Always rebuild after `git pull` | PM2 serves the `dist/` folder — pulling code doesn't auto-rebuild |

---

## 🔧 What Still Needs To Be Done

- [ ] **Set up HTTPS (SSL) directly on the VM** using Let's Encrypt + Certbot, so Cloudflare can be set to **Full (Strict)** SSL for better security
- [ ] **Add `admin.gomandap.com` to the backend `CORS_ORIGINS`** in the VM's `backend/.env` for stricter CORS control (currently permissive)
- [ ] **Protect the 2FA setup endpoints** (`/api/auth/admin/2fa/setup` and `/api/auth/admin/2fa/verify`) with admin middleware so they can't be called by anyone
- [ ] **Remove the `111111` master override** from `authController.js` in production — it's a security risk
- [ ] **Set up automatic deployment** via GitHub Actions so `git push` triggers a rebuild on the VM automatically
- [ ] **Add PM2 log rotation** to prevent disk fill-up on the Oracle VM

---

## 🆘 Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `Network Error or Invalid Code` | Wrong API URL in build OR `.env.local` present on VM | SSH → delete `admin/.env.local` → rebuild |
| `Invalid authentication code` | 2FA secret mismatch between phone and VM MongoDB | Re-run 2FA setup API and scan new QR code |
| `Invalid username or password` | Old build is being served | SSH → `git pull` → rebuild → restart PM2 |
| Page 404 on refresh | Missing `_redirects` file | Ensure `admin/public/_redirects` exists with `/* /index.html 200` |
| CORS error in browser console | Nginx blocking OPTIONS preflight | Check `/etc/nginx/conf.d/gomandap.conf` has OPTIONS block |
