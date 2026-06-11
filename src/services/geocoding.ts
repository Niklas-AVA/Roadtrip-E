export interface GeocodeResult {
  name: string;
  lat: number;
  lon: number;
}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

export async function geocodePlace(query: string): Promise<GeocodeResult[]> {
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '5',
    addressdetails: '0',
  });

  const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
    headers: {
      'Accept-Language': 'sv',
      // Nominatim usage policy requires identifying the application.
      'User-Agent': 'RoadtripE/1.0',
    },
  });

  if (!response.ok) {
    throw new Error('Kunde inte söka efter platsen just nu.');
  }

  const data = (await response.json()) as Array<{
    display_name: string;
    lat: string;
    lon: string;
  }>;

  return data.map((item) => ({
    name: item.display_name,
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
  }));
}
