import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip } from '../types';

const TRIP_KEY = 'roadtrip-e/current-trip';

const DEFAULT_TRIP: Trip = {
  id: 'default',
  name: 'Min Europaresa',
  stops: [],
};

export async function loadTrip(): Promise<Trip> {
  try {
    const raw = await AsyncStorage.getItem(TRIP_KEY);
    if (!raw) return DEFAULT_TRIP;
    return JSON.parse(raw) as Trip;
  } catch {
    return DEFAULT_TRIP;
  }
}

export async function saveTrip(trip: Trip): Promise<void> {
  await AsyncStorage.setItem(TRIP_KEY, JSON.stringify(trip));
}
