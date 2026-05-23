export const EMBY_URL = process.env.EMBY_URL || process.env.NEXT_PUBLIC_DEFAULT_EMBY_URL || 'http://X.X.X.X:8096';
export const EMBY_API_KEY = process.env.EMBY_API_KEY || '';

export const isEmbyUrlConfigured = Boolean(EMBY_URL && EMBY_URL !== 'http://X.X.X.X:8096' && EMBY_URL !== 'http://TU_IP_LOCAL:8096');
export const isEmbyKeyConfigured = Boolean(EMBY_API_KEY && EMBY_API_KEY !== 'YOUR_API_KEY_HERE' && EMBY_API_KEY !== 'tu_emby_api_key_aqui');
export const isEmbyConfigured = Boolean(isEmbyUrlConfigured && isEmbyKeyConfigured);
