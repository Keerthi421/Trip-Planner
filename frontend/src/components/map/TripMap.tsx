import { useEffect, useRef } from 'react';
import type { Attraction, DayItinerary } from '../../types';

interface TripMapProps {
  attractions: Attraction[];
  days: DayItinerary[];
  selectedDay: number;
}

const DAY_COLORS = [
  '#c8956c',
  '#7daea8',
  '#b8847c',
  '#d4b896',
  '#9a8a7a',
  '#8aab9c',
  '#c4a882',
];

export default function TripMap({ attractions, days, selectedDay }: TripMapProps) {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);
  const polylinesRef = useRef<any[]>([]);

  useEffect(() => {
    // Dynamic import to avoid SSR issues
    let isMounted = true;
    import('leaflet').then((L) => {
      if (!isMounted || !containerRef.current) return;

      // Fix default marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      if (!mapRef.current) {
        mapRef.current = L.map(containerRef.current, {
          center: [20, 0],
          zoom: 3,
          zoomControl: true,
        });

        // Dark tile layer (CartoDB Dark Matter)
        L.tileLayer(
          'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          {
            attribution: '© OpenStreetMap contributors © CARTO',
            subdomains: 'abcd',
            maxZoom: 20,
          }
        ).addTo(mapRef.current);
      }

      // Clear existing markers and polylines
      markersRef.current.forEach((m) => m.remove());
      polylinesRef.current.forEach((p) => p.remove());
      markersRef.current = [];
      polylinesRef.current = [];

      const allPoints: [number, number][] = [];

      // Collect all points from days
      days.forEach((day, dayIdx) => {
        const dayColor = DAY_COLORS[dayIdx % DAY_COLORS.length];
        const dayPoints: [number, number][] = [];

        const addPoint = (lat?: number, lng?: number, name?: string, desc?: string, time?: string) => {
          if (!lat || !lng) return;
          allPoints.push([lat, lng]);
          dayPoints.push([lat, lng]);

          const svgIcon = L.divIcon({
            html: `<div style="
              width: 28px; height: 28px; border-radius: 50%;
              background: ${dayColor};
              border: 2px solid white;
              display: flex; align-items: center; justify-content: center;
              font-size: 11px; font-weight: bold; color: white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.5);
              opacity: ${selectedDay === 0 || selectedDay === day.day_number ? 1 : 0.3};
            ">D${day.day_number}</div>`,
            className: '',
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });

          const marker = L.marker([lat, lng], { icon: svgIcon })
            .addTo(mapRef.current)
            .bindPopup(`
              <div style="min-width: 150px;">
                <div style="font-weight: bold; margin-bottom: 4px; color: ${dayColor}">Day ${day.day_number}${time ? ` • ${time}` : ''}</div>
                <div style="font-weight: 600; margin-bottom: 4px;">${name || 'Location'}</div>
                ${desc ? `<div style="font-size: 12px; opacity: 0.8;">${desc}</div>` : ''}
              </div>
            `);
          markersRef.current.push(marker);
        };

        // Morning
        if (day.morning?.lat && day.morning?.lng) {
          addPoint(day.morning.lat, day.morning.lng, day.morning.activity, day.morning.description, 'Morning');
        }
        // Lunch
        if (day.lunch && (day.lunch as any).lat && (day.lunch as any).lng) {
          addPoint((day.lunch as any).lat, (day.lunch as any).lng, day.lunch.restaurant, day.lunch.description, 'Lunch');
        }
        // Afternoon
        if (day.afternoon?.lat && day.afternoon?.lng) {
          addPoint(day.afternoon.lat, day.afternoon.lng, day.afternoon.activity, day.afternoon.description, 'Afternoon');
        }
        // Evening
        if (day.evening?.lat && day.evening?.lng) {
          addPoint(day.evening.lat, day.evening.lng, day.evening.activity, day.evening.description, 'Evening');
        }
        // Attractions
        if (day.attractions) {
          day.attractions.forEach((a) => {
            if (a.lat && a.lng) {
              addPoint(a.lat, a.lng, a.name, a.description);
            }
          });
        }

        // Draw polyline connecting same-day points
        if (dayPoints.length > 1) {
          const isSelectedOrAll = selectedDay === 0 || selectedDay === day.day_number;
          const polyline = L.polyline(dayPoints, {
            color: dayColor,
            weight: 2,
            opacity: isSelectedOrAll ? 0.7 : 0.2,
            dashArray: '6, 6',
          }).addTo(mapRef.current);
          polylinesRef.current.push(polyline);
        }
      });

      // Fit bounds to show all markers
      if (allPoints.length > 0) {
        const bounds = L.latLngBounds(allPoints);
        mapRef.current.fitBounds(bounds, { padding: [40, 40] });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [days, selectedDay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', minHeight: '400px', borderRadius: '12px', overflow: 'hidden' }}
    />
  );
}
