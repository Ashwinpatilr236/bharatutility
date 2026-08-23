import { Loader } from '@googlemaps/js-api-loader';

// Read API Key safely from environment
const rawApiKey =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_MAPS_API_KEY
    ? import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    : typeof process !== 'undefined' && process.env?.VITE_GOOGLE_MAPS_API_KEY
    ? process.env.VITE_GOOGLE_MAPS_API_KEY
    : ''
  ).trim();

let loaderInstance: Loader | null = null;
let mapsPromise: Promise<typeof google> | null = null;

export const isGoogleMapsConfigured = (): boolean => {
  return Boolean(rawApiKey && rawApiKey.length > 5);
};

export const loadGoogleMaps = (): Promise<typeof google> => {
  if (!isGoogleMapsConfigured()) {
    return Promise.reject(new Error('VITE_GOOGLE_MAPS_API_KEY is not configured in environment variables.'));
  }

  if (typeof window !== 'undefined' && window.google && window.google.maps) {
    return Promise.resolve(window.google);
  }

  if (!mapsPromise) {
    if (!loaderInstance) {
      loaderInstance = new Loader({
        apiKey: rawApiKey,
        version: 'weekly',
        libraries: ['places', 'geometry'],
      });
    }
    mapsPromise = (loaderInstance as any).load().then(() => window.google);
  }

  return mapsPromise;
};

export interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress: string;
}

export interface RouteResult {
  distanceKm: number;
  durationMins: number;
  formattedDistance: string;
  formattedDuration: string;
  startAddress: string;
  endAddress: string;
  directionsResult: any;
}

export interface NearbyPlaceItem {
  id: string;
  name: string;
  address: string;
  rating?: number;
  userRatingsTotal?: number;
  openNow?: boolean;
  lat: number;
  lng: number;
}

/**
 * Geocodes an address or PIN code into lat/lng coordinates
 */
export async function geocodeAddress(query: string): Promise<GeocodeResult | null> {
  try {
    const google = await loadGoogleMaps();
    const geocoder = new google.maps.Geocoder();

    return new Promise((resolve) => {
      geocoder.geocode({ address: query }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
          const loc = results[0].geometry.location;
          resolve({
            lat: loc.lat(),
            lng: loc.lng(),
            formattedAddress: results[0].formatted_address,
          });
        } else {
          resolve(null);
        }
      });
    });
  } catch (err) {
    console.warn('Geocoding failed:', err);
    return null;
  }
}

/**
 * Calculates route distance, travel duration, and directions
 */
export async function calculateRoute(
  origin: string,
  destination: string,
  travelMode: 'DRIVING' | 'WALKING' | 'BICYCLING' | 'TRANSIT' = 'DRIVING',
  waypoints: string[] = []
): Promise<RouteResult | null> {
  try {
    const google = await loadGoogleMaps();
    const directionsService = new google.maps.DirectionsService();

    const formattedWaypoints = waypoints
      .filter((w) => Boolean(w && w.trim()))
      .map((w) => ({ location: w, stopover: true }));

    const request: google.maps.DirectionsRequest = {
      origin,
      destination,
      waypoints: formattedWaypoints,
      travelMode: google.maps.TravelMode[travelMode] || google.maps.TravelMode.DRIVING,
    };

    return new Promise((resolve) => {
      directionsService.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result && result.routes && result.routes[0]) {
          const route = result.routes[0];
          let totalDistanceMeters = 0;
          let totalDurationSeconds = 0;

          route.legs.forEach((leg) => {
            totalDistanceMeters += leg.distance?.value || 0;
            totalDurationSeconds += leg.duration?.value || 0;
          });

          const distanceKm = Math.round((totalDistanceMeters / 1000) * 10) / 10;
          const durationMins = Math.round(totalDurationSeconds / 60);

          resolve({
            distanceKm,
            durationMins,
            formattedDistance: `${distanceKm} km`,
            formattedDuration:
              durationMins >= 60
                ? `${Math.floor(durationMins / 60)}h ${durationMins % 60}m`
                : `${durationMins} mins`,
            startAddress: route.legs[0]?.start_address || origin,
            endAddress: route.legs[route.legs.length - 1]?.end_address || destination,
            directionsResult: result,
          });
        } else {
          resolve(null);
        }
      });
    });
  } catch (err) {
    console.warn('Route calculation failed:', err);
    return null;
  }
}

/**
 * Searches nearby places using Google Places Service
 */
export async function searchNearbyPlaces(
  mapElement: HTMLElement,
  center: { lat: number; lng: number },
  typeKeyword: string
): Promise<NearbyPlaceItem[]> {
  try {
    const google = await loadGoogleMaps();
    const map = new google.maps.Map(mapElement, { center, zoom: 14 });
    const service = new google.maps.places.PlacesService(map);

    const request: google.maps.places.PlaceSearchRequest = {
      location: new google.maps.LatLng(center.lat, center.lng),
      radius: 5000,
      keyword: typeKeyword,
    };

    return new Promise((resolve) => {
      service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const items: NearbyPlaceItem[] = results.slice(0, 12).map((place) => ({
            id: place.place_id || Math.random().toString(),
            name: place.name || 'Nearby Place',
            address: place.vicinity || '',
            rating: place.rating,
            userRatingsTotal: place.user_ratings_total,
            openNow: place.opening_hours?.isOpen ? place.opening_hours.isOpen() : undefined,
            lat: place.geometry?.location?.lat() || center.lat,
            lng: place.geometry?.location?.lng() || center.lng,
          }));
          resolve(items);
        } else {
          resolve([]);
        }
      });
    });
  } catch (err) {
    console.warn('Nearby places search failed:', err);
    return [];
  }
}
