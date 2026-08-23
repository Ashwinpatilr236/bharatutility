import React, { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps, isGoogleMapsConfigured } from '../../services/googleMapsService';
import { MapPin, ExternalLink, AlertTriangle, Compass } from 'lucide-react';

export interface MapMarkerItem {
  id: string;
  title: string;
  lat: number;
  lng: number;
  description?: string;
}

interface GoogleMapViewProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: MapMarkerItem[];
  directionsResult?: any;
  height?: string;
  fallbackTitle?: string;
}

// Dark mode silver & slate map styling
const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#263c3f' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b9a76' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1f2835' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] },
  { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
  { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#17263c' }] },
];

export const GoogleMapView: React.FC<GoogleMapViewProps> = ({
  center = { lat: 20.5937, lng: 78.9629 }, // Center of India
  zoom = 12,
  markers = [],
  directionsResult,
  height = '380px',
  fallbackTitle = 'Location Map View',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isGoogleMapsConfigured()) {
      setHasApiKey(false);
      return;
    }

    if (!mapContainerRef.current) return;

    let isMounted = true;

    loadGoogleMaps()
      .then((google) => {
        if (!isMounted || !mapContainerRef.current) return;

        const isDarkMode = document.documentElement.classList.contains('dark');

        const mapOptions: google.maps.MapOptions = {
          center,
          zoom,
          styles: isDarkMode ? DARK_MAP_STYLE : undefined,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
        };

        const map = new google.maps.Map(mapContainerRef.current, mapOptions);

        // Render Directions Route if provided
        if (directionsResult) {
          const directionsRenderer = new google.maps.DirectionsRenderer({
            map,
            directions: directionsResult,
            suppressMarkers: markers.length > 0, // suppress default if custom markers exist
          });
        }

        // Render Markers
        if (markers.length > 0) {
          const bounds = new google.maps.LatLngBounds();
          const infoWindow = new google.maps.InfoWindow();

          markers.forEach((m) => {
            const markerPos = { lat: m.lat, lng: m.lng };
            const marker = new google.maps.Marker({
              position: markerPos,
              map,
              title: m.title,
            });

            bounds.extend(markerPos);

            marker.addListener('click', () => {
              infoWindow.setContent(`
                <div style="padding: 6px; font-family: sans-serif; max-width: 200px;">
                  <strong style="font-size: 13px; color: #111;">${m.title}</strong>
                  ${m.description ? `<p style="font-size: 11px; color: #555; margin-top: 4px;">${m.description}</p>` : ''}
                </div>
              `);
              infoWindow.open(map, marker);
            });
          });

          if (markers.length > 1 && !directionsResult) {
            map.fitBounds(bounds);
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn('Google Maps Load Error:', err);
          setLoadError('Failed to load Google Maps JS SDK.');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [center.lat, center.lng, zoom, markers, directionsResult]);

  // External Map link helper
  const externalMapUrl =
    markers.length > 0
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(markers[0].lat + ',' + markers[0].lng)}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(center.lat + ',' + center.lng)}`;

  // Render Fallback if no API key or map error
  if (!hasApiKey || loadError) {
    return (
      <div
        style={{ height }}
        className="w-full rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/60 p-6 flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden"
      >
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-accent flex items-center justify-center">
          <MapPin className="w-6 h-6 text-accent" />
        </div>

        <div className="space-y-1">
          <div className="text-sm font-bold text-neutral-900 dark:text-white">{fallbackTitle}</div>
          <p className="text-xs text-neutral-500 max-w-sm">
            {markers.length > 0 ? `${markers[0].title} — Location details` : 'Interactive Google Map visualization'}
          </p>
        </div>

        <a
          href={externalMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-xl bg-accent text-white font-bold text-xs inline-flex items-center gap-1.5 hover:bg-accent/90 transition-colors shadow-xs"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Open Location in Google Maps</span>
        </a>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border border-neutral-200/80 dark:border-neutral-800 shadow-sm">
      <div ref={mapContainerRef} style={{ height }} className="w-full" />
    </div>
  );
};
