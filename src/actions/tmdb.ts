'use server'

import { getDynamicConfig } from './config';

export async function fetchTmdbPosters(tmdbId: string | number) {
  const { tmdbApiKey } = await getDynamicConfig();

  if (!tmdbId || !tmdbApiKey) {
    return [];
  }

  try {
    const url = `https://api.themoviedb.org/3/movie/${tmdbId}/images?api_key=${tmdbApiKey}&include_image_language=en,es,it,null`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      // Cache the image list per movie for a long time (1 hour) since movie posters rarely change
      next: { revalidate: 3600 } 
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from TMDb: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || !data.posters) {
      return [];
    }

    // We return just the file_path array to keep the payload small
    return data.posters.map((p: any) => p.file_path);
  } catch (error) {
    console.error(`Error fetching TMDb posters for ID ${tmdbId}:`, error);
    return [];
  }
}

export async function fetchTmdbBackdrops(tmdbId: string | number) {
  const { tmdbApiKey } = await getDynamicConfig();

  if (!tmdbId || !tmdbApiKey) {
    return [];
  }

  try {
    const url = `https://api.themoviedb.org/3/movie/${tmdbId}/images?api_key=${tmdbApiKey}&include_image_language=en,es,it,null`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      next: { revalidate: 3600 } 
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from TMDb: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || !data.backdrops) {
      return [];
    }

    // Return the file_path array for backdrops
    return data.backdrops.map((b: any) => b.file_path);
  } catch (error) {
    console.error(`Error fetching TMDb backdrops for ID ${tmdbId}:`, error);
    return [];
  }
}
