import { FacilityFlags, Place, PlaceCategory } from '../types';

const OVERPASS_URLS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];

const REQUEST_TIMEOUT_MS = 20000;

interface OverpassElement {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

function buildQuery(lat: number, lon: number, radiusMeters: number): string {
  return `
    [out:json][timeout:25];
    (
      nwr["tourism"="camp_site"](around:${radiusMeters},${lat},${lon});
      nwr["tourism"="caravan_site"](around:${radiusMeters},${lat},${lon});
      nwr["natural"="beach"](around:${radiusMeters},${lat},${lon});
      nwr["tourism"="attraction"](around:${radiusMeters},${lat},${lon});
    );
    out center tags;
  `;
}

function categorize(tags: Record<string, string>): PlaceCategory | null {
  if (tags.tourism === 'camp_site') return 'camping';
  if (tags.tourism === 'caravan_site') return 'stellplatz';
  if (tags.natural === 'beach') return 'beach';
  if (tags.tourism === 'attraction') return 'attraction';
  return null;
}

function parseFacilities(tags: Record<string, string>): FacilityFlags {
  const yes = (value?: string) => value === 'yes';

  return {
    electricity: yes(tags.electricity) || tags.power_supply === 'yes',
    water: yes(tags.drinking_water) || yes(tags.water),
    toilet: yes(tags.toilets),
    shower: yes(tags.shower),
    wasteDisposal: yes(tags.sanitary_dump_station) || yes(tags.waste_disposal),
    wifi: tags.internet_access !== undefined && tags.internet_access !== 'no',
    petsAllowed: yes(tags.dog),
  };
}

function parsePlaces(data: OverpassResponse): Place[] {
  const places: Place[] = [];

  for (const element of data.elements) {
    const tags = element.tags ?? {};
    const category = categorize(tags);
    if (!category) continue;

    const placeLat = element.lat ?? element.center?.lat;
    const placeLon = element.lon ?? element.center?.lon;
    if (placeLat === undefined || placeLon === undefined) continue;

    places.push({
      id: `${category}-${element.id}`,
      name: tags.name ?? defaultNameFor(category),
      category,
      lat: placeLat,
      lon: placeLon,
      facilities: parseFacilities(tags),
      raw: tags,
    });
  }

  return places;
}

async function queryOverpass(url: string, query: string): Promise<OverpassResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Overpass svarade med fel (${response.status}).`);
    }

    return (await response.json()) as OverpassResponse;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchPlacesNear(
  lat: number,
  lon: number,
  radiusMeters = 15000
): Promise<Place[]> {
  const query = buildQuery(lat, lon, radiusMeters);

  try {
    const data = await Promise.any(
      OVERPASS_URLS.map((url) => queryOverpass(url, query))
    );
    return parsePlaces(data);
  } catch (e) {
    console.warn('Overpass fetch failed on all mirrors', e);
    throw new Error(
      'Kunde inte hämta platser just nu. Kontrollera internetanslutningen och försök igen.'
    );
  }
}

function defaultNameFor(category: PlaceCategory): string {
  switch (category) {
    case 'camping':
      return 'Camping (namnlös)';
    case 'stellplatz':
      return 'Ställplats (namnlös)';
    case 'beach':
      return 'Strand (namnlös)';
    case 'attraction':
      return 'Sevärdhet (namnlös)';
  }
}
