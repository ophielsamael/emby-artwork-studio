'use server'

import { getDynamicConfig } from './config';
import { getAppliedOverlays } from './db';

export async function fetchEmbyLibraries() {
  try {
    const { embyUrl, embyApiKey } = await getDynamicConfig();
    const url = `${embyUrl}/emby/Library/SelectableMediaFolders?X-Emby-Token=${embyApiKey}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      next: { revalidate: 3600 } 
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch libraries from Emby: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data) {
      return [];
    }

    return data.map((item: any) => ({
      id: item.Id,
      name: item.Name,
      collectionType: item.CollectionType || 'unknown'
    }));
  } catch (error) {
    console.error("Error fetching Emby Libraries:", error);
    return [];
  }
}

export async function fetchEmbyMovies(parentId: string, collectionType?: string) {
  try {
    const { embyUrl, embyApiKey } = await getDynamicConfig();
    let url = `${embyUrl}/emby/Items?ParentId=${parentId}&Recursive=true&IncludeItemTypes=Movie,Series,MusicVideo,Video&Fields=PrimaryImageAspectRatio,Genres,ProductionYear,CommunityRating,ProviderIds&X-Emby-Token=${embyApiKey}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from Emby: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || !data.Items) {
      return [];
    }
    
    let rawItems = data.Items;

    // Strict client-side filtering just in case Emby ignores the URL parameter
    const allowedTypes = ['Movie', 'Series', 'MusicVideo', 'Video'];
    rawItems = rawItems.filter((item: any) => allowedTypes.includes(item.Type));

    const appliedOverlays = getAppliedOverlays();

    // Map Emby items to our frontend Movie interface
    const movies = rawItems.map((item: any) => ({
      id: item.Id,
      title: item.Name || 'Unknown Title',
      year: item.ProductionYear || 0,
      genre: (item.Genres && item.Genres.length > 0) ? item.Genres.join(" / ") : "Desconocido",
      rating: item.CommunityRating ? parseFloat(item.CommunityRating.toFixed(1)) : 0.0,
      tmdbId: item.ProviderIds?.Tmdb || null,
      // Map the primary image URL pointing directly to our internal secure image proxy
      currentPoster: `/api/image-proxy?itemId=${item.Id}`,
      posters: [`/api/image-proxy?itemId=${item.Id}`], 
      selectedOverlay: appliedOverlays[item.Id] || null,
      backdrop: "rgba(82, 181, 75, 0.15)"
    }));

    return movies;
  } catch (error) {
    console.error("Error fetching Emby movies:", error);
    return [];
  }
}
