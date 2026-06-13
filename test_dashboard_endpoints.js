const axios = require('axios');

async function test() {
  const API_URL = 'http://localhost:5175/api';
  try {
    const vRes = await axios.get(`${API_URL}/vendors`);
    console.log('/vendors SUCCESS', vRes.data.length);
  } catch(e) { console.error('/vendors FAILED', e.message); }

  try {
    const pRes = await axios.get(`${API_URL}/public/admin/list`);
    console.log('/public/admin/list SUCCESS', pRes.data.length);
  } catch(e) { console.error('/public/admin/list FAILED', e.message); }

  try {
    const oRes = await axios.get(`${API_URL}/vendors/out-of-bounds`);
    console.log('/vendors/out-of-bounds SUCCESS', oRes.data.length);
  } catch(e) { console.error('/vendors/out-of-bounds FAILED', e.message); }
}

test();
