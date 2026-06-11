import { TripStop } from '../types';

const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving';

export interface RouteLeg {
  distanceMeters: number;
  durationSeconds: number;
}

export interface RouteResult {
  coordinates: { latitude: number; longitude: number }[];
  distanceMeters: number;
  durationSeconds: number;
  legs: RouteLeg[];
}

export async function fetchRoute(stops: TripStop[]): Promise<RouteResult | null> {
  if (stops.length < 2) return null;

  const coords = stops.map((stop) => `${stop.lon},${stop.lat}`).join(';');
  const url = `${OSRM_URL}/${coords}?overview=full&geometries=geojson`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Kunde inte beräkna rutten just nu (OSRM).');
  }

  const data = await response.json();
  if (data.code !== 'Ok' || !data.routes?.length) return null;

  const route = data.routes[0];
  const coordinates = (route.geometry.coordinates as [number, number][]).map(
    ([lon, lat]) => ({ latitude: lat, longitude: lon })
  );

  const legs: RouteLeg[] = (route.legs ?? []).map((leg: any) => ({
    distanceMeters: leg.distance,
    durationSeconds: leg.duration,
  }));

  return {
    coordinates,
    distanceMeters: route.distance,
    durationSeconds: route.duration,
    legs,
  };
}

/**
 * Lightweight version that only fetches per-leg distance/duration, without the
 * full route geometry. Used to show "sträckan" between delmål as the user
 * builds up the plan.
 */
export async function fetchLegs(stops: TripStop[]): Promise<RouteLeg[]> {
  if (stops.length < 2) return [];

  const coords = stops.map((stop) => `${stop.lon},${stop.lat}`).join(';');
  const url = `${OSRM_URL}/${coords}?overview=false`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Kunde inte beräkna sträckan just nu (OSRM).');
  }

  const data = await response.json();
  if (data.code !== 'Ok' || !data.routes?.length) return [];

  const route = data.routes[0];
  return (route.legs ?? []).map((leg: any) => ({
    distanceMeters: leg.distance,
    durationSeconds: leg.duration,
  }));
}
