'use server'

import { cookies } from 'next/headers';
import { EMBY_URL as DEFAULT_EMBY_URL, EMBY_API_KEY as DEFAULT_EMBY_API_KEY } from '../config/emby';
import { TMDB_API_KEY as DEFAULT_TMDB_API_KEY } from '../config/tmdb';

export async function getDynamicConfig() {
  const cookieStore = cookies();
  const configCookie = cookieStore.get('artwork_studio_config')?.value;
  
  let config = {
    embyUrl: DEFAULT_EMBY_URL,
    embyApiKey: DEFAULT_EMBY_API_KEY,
    tmdbApiKey: DEFAULT_TMDB_API_KEY
  };

  if (configCookie) {
    try {
      const parsed = JSON.parse(decodeURIComponent(configCookie));
      if (parsed.EMBY_SERVER_URL) config.embyUrl = parsed.EMBY_SERVER_URL;
      if (parsed.EMBY_API_KEY) config.embyApiKey = parsed.EMBY_API_KEY;
      if (parsed.TMDB_API_KEY) config.tmdbApiKey = parsed.TMDB_API_KEY;
    } catch (e) {}
  }
  return config;
}

export async function getConfigStatus() {
  const config = await getDynamicConfig();
  
  const isEmbyUrlConfigured = Boolean(config.embyUrl && config.embyUrl !== 'http://X.X.X.X:8096' && config.embyUrl !== 'http://TU_IP_LOCAL:8096');
  const isEmbyKeyConfigured = Boolean(config.embyApiKey && config.embyApiKey !== 'YOUR_API_KEY_HERE' && config.embyApiKey !== 'tu_emby_api_key_aqui');
  const isTmdbConfigured = Boolean(config.tmdbApiKey && config.tmdbApiKey !== 'YOUR_API_KEY_HERE' && config.tmdbApiKey !== 'tu_tmdb_api_key_aqui');

  return {
    isEmbyUrlConfigured,
    isEmbyKeyConfigured,
    isTmdbConfigured,
    isFullyConfigured: isEmbyUrlConfigured && isEmbyKeyConfigured
  };
}
