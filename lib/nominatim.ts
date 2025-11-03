/**
 * Nominatim API service for geocoding and place search
 * Documentation: https://nominatim.org/release-docs/latest/api/Overview/
 */

export interface NominatimPlace {
  place_id: number;
  licence: string;
  powered_by: string;
  osm_type: string;
  osm_id: number;
  boundingbox: [string, string, string, string];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  icon?: string;
}

export interface NominatimSearchResult {
  place_id: number;
  licence: string;
  powered_by: string;
  osm_type: string;
  osm_id: number;
  boundingbox: [string, string, string, string];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  icon?: string;
}

/**
 * Search for places using Nominatim API
 * @param query - Search query (e.g., "Roma, Italia")
 * @param limit - Maximum number of results (default: 5)
 * @returns Array of place results
 */
export async function searchPlaces(
  query: string,
  limit: number = 5
): Promise<NominatimPlace[]> {
  if (!query || query.trim().length === 0) {
    return [];
  }

  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=${limit}&addressdetails=1&extratags=1&namedetails=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TravelManager/1.0 (https://github.com/yourusername/travelmanager)', // Nominatim requires User-Agent
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data: NominatimSearchResult[] = await response.json();
    return data.map((item) => ({
      place_id: item.place_id,
      licence: item.licence,
      powered_by: item.powered_by,
      osm_type: item.osm_type,
      osm_id: item.osm_id,
      boundingbox: item.boundingbox,
      lat: item.lat,
      lon: item.lon,
      display_name: item.display_name,
      class: item.class,
      type: item.type,
      importance: item.importance,
      icon: item.icon,
    }));
  } catch (error) {
    console.error('Error searching places with Nominatim:', error);
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
    latitude: parseFloat(place.lat),
    longitude: parseFloat(place.lon),
  };
}

