const LOCAL_API_URL = 'http://localhost:5002/api';
const PRODUCTION_API_URL = 'https://gomandap-api.onrender.com/api';

const isLocalHost =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);

export const API_URL = import.meta.env.VITE_API_URL || (isLocalHost ? LOCAL_API_URL : PRODUCTION_API_URL);
