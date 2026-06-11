import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { Trip, TripStop } from '../types';
import { loadTrip, saveTrip } from '../storage/tripStorage';

interface TripContextValue {
  trip: Trip;
  loading: boolean;
  addStop: (stop: Omit<TripStop, 'id'>) => void;
  removeStop: (id: string) => void;
  updateStopDays: (id: string, days: number) => void;
  moveStop: (id: string, direction: 'up' | 'down') => void;
}

const TripContext = createContext<TripContextValue | undefined>(undefined);

const EMPTY_TRIP: Trip = { id: 'default', name: 'Min Europaresa', stops: [] };

export function TripProvider({ children }: { children: React.ReactNode }) {
  const [trip, setTrip] = useState<Trip>(EMPTY_TRIP);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrip().then((loaded) => {
      setTrip(loaded);
      setLoading(false);
    });
  }, []);

  const persist = useCallback((next: Trip) => {
    setTrip(next);
    saveTrip(next);
  }, []);

  const addStop = useCallback(
    (stop: Omit<TripStop, 'id'>) => {
      const newStop: TripStop = { ...stop, id: `${Date.now()}-${Math.random()}` };
      persist({ ...trip, stops: [...trip.stops, newStop] });
    },
    [trip, persist]
  );

  const removeStop = useCallback(
    (id: string) => {
      persist({ ...trip, stops: trip.stops.filter((s) => s.id !== id) });
    },
    [trip, persist]
  );

  const updateStopDays = useCallback(
    (id: string, days: number) => {
      persist({
        ...trip,
        stops: trip.stops.map((s) => (s.id === id ? { ...s, days } : s)),
      });
    },
    [trip, persist]
  );

  const moveStop = useCallback(
    (id: string, direction: 'up' | 'down') => {
      const index = trip.stops.findIndex((s) => s.id === id);
      if (index === -1) return;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= trip.stops.length) return;

      const stops = [...trip.stops];
      [stops[index], stops[targetIndex]] = [stops[targetIndex], stops[index]];
      persist({ ...trip, stops });
    },
    [trip, persist]
  );

  return (
    <TripContext.Provider
      value={{ trip, loading, addStop, removeStop, updateStopDays, moveStop }}
    >
      {children}
    </TripContext.Provider>
  );
}

export function useTrip(): TripContextValue {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTrip must be used within a TripProvider');
  return ctx;
}
