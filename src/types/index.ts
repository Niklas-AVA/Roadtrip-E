export type PlaceCategory = 'camping' | 'stellplatz' | 'beach' | 'attraction';

export interface TripStop {
  id: string;
  name: string;
  lat: number;
  lon: number;
  days: number;
}

export interface Trip {
  id: string;
  name: string;
  stops: TripStop[];
}

export interface FacilityFlags {
  electricity?: boolean;
  water?: boolean;
  toilet?: boolean;
  shower?: boolean;
  wasteDisposal?: boolean;
  wifi?: boolean;
  petsAllowed?: boolean;
}

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  lat: number;
  lon: number;
  facilities: FacilityFlags;
  raw?: Record<string, string>;
}

export const FACILITY_LABELS: Record<keyof FacilityFlags, string> = {
  electricity: 'El',
  water: 'Vatten',
  toilet: 'Toalett',
  shower: 'Dusch',
  wasteDisposal: 'Tömning',
  wifi: 'Wifi',
  petsAllowed: 'Husdjur tillåtna',
};
