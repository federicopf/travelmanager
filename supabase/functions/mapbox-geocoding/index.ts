// Supabase Edge Function per Mapbox Geocoding API
// Deno runtime

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get Mapbox token from environment secrets
    const mapboxToken = Deno.env.get('MAPBOX_ACCESS_TOKEN');
    
    if (!mapboxToken) {
      throw new Error('MAPBOX_ACCESS_TOKEN non configurato nelle variabili d\'ambiente');
    }

    // Parse request body
    const { query, limit = 5 } = await req.json();

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Call Mapbox Geocoding API
    const encodedQuery = encodeURIComponent(query);
    const mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json?access_token=${mapboxToken}&limit=${limit}&language=it&types=place,locality,neighborhood,address,poi`;

    const response = await fetch(mapboxUrl);

    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Transform Mapbox response to our format
    const results = data.features.map((feature: any) => ({
      id: feature.id,
      name: feature.place_name,
      address: feature.place_name,
      latitude: feature.center[1],
      longitude: feature.center[0],
      type: feature.place_type[0],
      context: feature.context?.map((ctx: any) => ctx.text).join(', ') || '',
    }));

    return new Response(
      JSON.stringify({ results }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Errore interno del server' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

