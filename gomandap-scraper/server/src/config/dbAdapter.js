const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../../data');
const vendorsFile = path.join(dataDir, 'scraped_vendors.json');
const outOfBoundsFile = path.join(dataDir, 'out_of_bounds.json');
const usersFile = path.join(dataDir, 'users.json');

// Ensure files exist
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(vendorsFile)) fs.writeFileSync(vendorsFile, JSON.stringify([]));
if (!fs.existsSync(outOfBoundsFile)) fs.writeFileSync(outOfBoundsFile, JSON.stringify([]));
if (!fs.existsSync(usersFile)) {
  // Default Admin User for testing the SaaS
  const defaultUsers = [{
    id: 'admin_1',
    username: 'admin',
    password: 'password123',
    role: 'admin',
    subscription: 'Enterprise'
  }];
  fs.writeFileSync(usersFile, JSON.stringify(defaultUsers, null, 2));
}

// --- USERS ---
function getUsers() {
  try { return JSON.parse(fs.readFileSync(usersFile, 'utf-8')); } catch (e) { return []; }
}
function saveUsers(data) { fs.writeFileSync(usersFile, JSON.stringify(data, null, 2)); }

// --- MULTI-TENANT VENDORS ---
function getVendors(userId) {
  try {
    const all = JSON.parse(fs.readFileSync(vendorsFile, 'utf-8'));
    if (!userId) return all; // For legacy operations or superadmin
    return all.filter(v => v.userId === userId);
  } catch (e) {
    return [];
  }
}

function saveVendor(userId, vendor) {
  const all = getVendors(); // get all bypassing filter
  const idx = all.findIndex(v => v.id === vendor.id);
  vendor.userId = userId || vendor.userId || 'admin_1'; // Enforce tenant tracking
  
  if (idx !== -1) {
    all[idx] = vendor;
  } else {
    all.push(vendor);
  }
  fs.writeFileSync(vendorsFile, JSON.stringify(all, null, 2));
}

function deleteVendor(userId, vendorId) {
  let all = getVendors();
  all = all.filter(v => !(v.id === vendorId && v.userId === userId));
  fs.writeFileSync(vendorsFile, JSON.stringify(all, null, 2));
}

function updateVendorsBatch(userId, updatedList) {
  const all = getVendors();
  const others = all.filter(v => v.userId !== userId);
  const updatedWithTenant = updatedList.map(v => ({...v, userId: userId}));
  fs.writeFileSync(vendorsFile, JSON.stringify([...others, ...updatedWithTenant], null, 2));
}

function saveVendors(data) {
  // Legacy method for saving the entire array
  fs.writeFileSync(vendorsFile, JSON.stringify(data, null, 2));
}

// --- OUT OF BOUNDS ---
function getOutOfBounds() {
  try { return JSON.parse(fs.readFileSync(outOfBoundsFile, 'utf-8')); } catch (e) { return []; }
}
function saveOutOfBounds(data) { fs.writeFileSync(outOfBoundsFile, JSON.stringify(data, null, 2)); }
function saveOutOfBoundsVendor(vendor) {
  const all = getOutOfBounds();
  // Deduplicate by ID, MapsLink, or exact Name to prevent duplicates during grid scraping
  const idx = all.findIndex(v => 
    v.id === vendor.id || 
    (v.mapsLink && vendor.mapsLink && v.mapsLink === vendor.mapsLink) || 
    (v.name && vendor.name && v.name === vendor.name)
  );
  
  if (idx !== -1) {
    // Preserve the original ID so UI updates work correctly
    vendor.id = all[idx].id;
    all[idx] = { ...all[idx], ...vendor };
  } else {
    all.push(vendor);
  }
  fs.writeFileSync(outOfBoundsFile, JSON.stringify(all, null, 2));
}

// --- EMPLOYEES (Legacy Support) ---
const employeesFile = path.join(dataDir, 'employees.json');
if (!fs.existsSync(employeesFile)) fs.writeFileSync(employeesFile, JSON.stringify([]));

function getEmployees() {
  try { return JSON.parse(fs.readFileSync(employeesFile, 'utf-8')); } catch (e) { return []; }
}
function saveEmployees(data) { fs.writeFileSync(employeesFile, JSON.stringify(data, null, 2)); }

// --- PUBLIC USERS ---
const publicUsersFile = path.join(dataDir, 'public_users.json');
if (!fs.existsSync(publicUsersFile)) fs.writeFileSync(publicUsersFile, JSON.stringify([]));

function getPublicUsers() {
  try { return JSON.parse(fs.readFileSync(publicUsersFile, 'utf-8')); } catch (e) { return []; }
}
function savePublicUsers(data) { fs.writeFileSync(publicUsersFile, JSON.stringify(data, null, 2)); }

module.exports = {
  getUsers,
  saveUsers,
  getVendors,
  saveVendors,
  saveVendor,
  deleteVendor,
  updateVendorsBatch,
  getEmployees,
  saveEmployees,
  getPublicUsers,
  savePublicUsers,
  getOutOfBounds,
  saveOutOfBounds,
  saveOutOfBoundsVendor
};
