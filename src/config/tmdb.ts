export const TMDB_API_KEY = process.env.TMDB_API_KEY || '';
export const isTmdbConfigured = Boolean(TMDB_API_KEY && TMDB_API_KEY !== 'YOUR_API_KEY_HERE' && TMDB_API_KEY !== 'tu_tmdb_api_key_aqui');
