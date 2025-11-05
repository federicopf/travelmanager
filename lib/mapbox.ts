/**
 * Mapbox Geocoding service using Supabase Edge Function as proxy
 * This allows us to keep the Mapbox token secret on the server side
 */

export interface MapboxPlace {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: string;
  context: string;
}

/**
 * Search for places using Mapbox Geocoding API via Supabase Edge Function
 * @param query - Search query (e.g., "Roma, Italia")
 * @param limit - Maximum number of results (default: 5)
 * @returns Array of place results
 */
export async function searchPlaces(
  query: string,
  limit: number = 5
): Promise<MapboxPlace[]> {
  if (!query || query.trim().length === 0) {
    return [];
  }

  try {
    const { supabase } = await import('@/lib/supabase');
    
    console.log('🔍 Searching places for:', query);
    console.log('📡 Supabase URL:', supabase.supabaseUrl || 'not available');
    
    const { data, error } = await supabase.functions.invoke('mapbox-geocoding', {
      body: { query: query.trim(), limit },
    });

    console.log('📦 Response data:', data);
    console.log('❌ Response error:', error);

    if (error) {
      console.error('❌ Supabase function error:', error);
      throw new Error(error.message || 'Errore nella ricerca luoghi');
    }

    if (!data || !data.results) {
      console.warn('⚠️ No results in response');
      return [];
    }

    console.log('✅ Found', data.results.length, 'results');
    return data.results;
  } catch (error) {
    console.error('❌ Error searching places with Mapbox:', error);
    throw error;
  }
}

/**
 * Get coordinates from a place name
 * @param placeName - Name of the place
 * @returns Object with latitude and longitude, or null if not found
 */
export async function getCoordinatesFromPlace(
  placeName: string
): Promise<{ latitude: number; longitude: number } | null> {
  const results = await searchPlaces(placeName, 1);
  if (results.length === 0) {
    return null;
  }

  const place = results[0];
  return {
    latitude: place.latitude,
    longitude: place.longitude,
  };
}

