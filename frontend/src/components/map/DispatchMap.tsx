'use client';
import { useRef, useEffect, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useSocketStore } from '@/store/socket.store';
import { headingToDegrees, responderTypeConfig } from '@/lib/utils';
import type { Vehicle, Incident } from '@/types';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

// ─── SVG vehicle markers ──────────────────────────────────────────────────────
const VEHICLE_SVG = (color: string) => `
<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
  <defs>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
      <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <circle cx="18" cy="18" r="16" fill="${color}20" stroke="${color}" stroke-width="1.5"/>
  <circle cx="18" cy="18" r="5" fill="${color}" filter="url(#glow)"/>
  <polygon points="18,4 21,14 15,14" fill="${color}" opacity="0.9"/>
</svg>`;

const INCIDENT_SVG = (color: string) => `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
  <path d="M16 0 C7.163 0 0 7.163 0 16 C0 24.837 16 40 16 40 C16 40 32 24.837 32 16 C32 7.163 24.837 0 16 0Z"
        fill="${color}" opacity="0.9"/>
  <circle cx="16" cy="16" r="7" fill="white" opacity="0.95"/>
  <text x="16" y="20" text-anchor="middle" font-size="10" font-weight="bold" fill="${color}">!</text>
</svg>`;

interface Props {
  vehicles:           Vehicle[];
  incidents:          Incident[];
  onVehicleClick:     (id: string) => void;
  onIncidentClick:    (id: string) => void;
}

export function DispatchMap({ vehicles, incidents, onVehicleClick, onIncidentClick }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map          = useRef<mapboxgl.Map | null>(null);
  const markers      = useRef<Record<string, mapboxgl.Marker>>({});
  const incMarkers   = useRef<Record<string, mapboxgl.Marker>>({});

  const { vehicles: liveVehicles } = useSocketStore();

  // ── Initialise map ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style:     'mapbox://styles/mapbox/dark-v11',
      center:    [-0.187, 5.603],  // Accra, Ghana
      zoom:      11,
      attributionControl: false,
    });

    map.current.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'bottom-right');

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // ── Update vehicle markers ──────────────────────────────────────────────────
  useEffect(() => {
    if (!map.current) return;

    vehicles.forEach((vehicle) => {
      const liveData = liveVehicles[vehicle._id];
      const lat  = liveData?.latitude  ?? vehicle.currentLocation.latitude;
      const lng  = liveData?.longitude ?? vehicle.currentLocation.longitude;
      const heading = liveData?.heading ?? vehicle.heading;

      const cfg     = responderTypeConfig[vehicle.type];
      const color   = cfg.mapColor;
      const degrees = headingToDegrees[heading] ?? 0;

      if (markers.current[vehicle._id]) {
        // Smooth position update
        markers.current[vehicle._id].setLngLat([lng, lat]);
        const el = markers.current[vehicle._id].getElement();
        el.style.transform = `rotate(${degrees}deg)`;
      } else {
        // Create new marker
        const el       = document.createElement('div');
        el.innerHTML   = VEHICLE_SVG(color);
        el.style.cursor = 'pointer';
        el.style.transform = `rotate(${degrees}deg)`;
        el.style.transition = 'transform 0.5s ease';
        el.title       = `${vehicle.vehicleCode} — ${vehicle.type}`;

        el.addEventListener('click', () => onVehicleClick(vehicle._id));

        const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
          .setLngLat([lng, lat])
          .addTo(map.current!);

        markers.current[vehicle._id] = marker;
      }
    });

    // Remove markers for vehicles no longer in list
    Object.keys(markers.current).forEach((id) => {
      if (!vehicles.find((v) => v._id === id)) {
        markers.current[id].remove();
        delete markers.current[id];
      }
    });
  }, [vehicles, liveVehicles, onVehicleClick]);

  // ── Update incident markers ─────────────────────────────────────────────────
  useEffect(() => {
    if (!map.current) return;

    incidents.forEach((incident) => {
      const COLORS: Record<string, string> = {
        MEDICAL: '#CCFF00', FIRE: '#FF2A55', CRIME: '#00F0FF',
        ACCIDENT: '#FF8A00', OTHER: '#A855F7',
      };
      const color = COLORS[incident.incidentType] ?? '#A855F7';

      if (!incMarkers.current[incident.id]) {
        const el     = document.createElement('div');
        el.innerHTML = INCIDENT_SVG(color);
        el.style.cursor = 'pointer';
        el.addEventListener('click', () => onIncidentClick(incident.id));

        const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([incident.longitude, incident.latitude])
          .addTo(map.current!);

        incMarkers.current[incident.id] = marker;
      }
    });

    Object.keys(incMarkers.current).forEach((id) => {
      if (!incidents.find((i) => i.id === id)) {
        incMarkers.current[id].remove();
        delete incMarkers.current[id];
      }
    });
  }, [incidents, onIncidentClick]);

  return (
    <div ref={mapContainer} className="w-full h-full" />
  );
}
