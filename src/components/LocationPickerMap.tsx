import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";

type Coordinates = {
  lat: number;
  lng: number;
};

interface LocationPickerMapProps {
  value?: Coordinates;
  onChange: (coords: Coordinates) => void;
}

const DEFAULT_MAP_CENTER: [number, number] = [14.653776, 120.960153];

export function LocationPickerMap({ value, onChange }: LocationPickerMapProps) {
  const center = useMemo<[number, number]>(() => (value ? [value.lat, value.lng] : DEFAULT_MAP_CENTER), [value]);
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.CircleMarker | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!mapElementRef.current || mapRef.current) return;

    const map = L.map(mapElementRef.current, {
      center,
      zoom: 17,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    map.on("click", (event: L.LeafletMouseEvent) => {
      const coords = {
        lat: Number(event.latlng.lat.toFixed(6)),
        lng: Number(event.latlng.lng.toFixed(6)),
      };
      onChangeRef.current(coords);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.setView(center, map.getZoom());

    if (!value) {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      return;
    }

    const latLng: L.LatLngExpression = [value.lat, value.lng];
    if (!markerRef.current) {
      markerRef.current = L.circleMarker(latLng, {
        radius: 8,
        color: "#2563eb",
        fillColor: "#2563eb",
        fillOpacity: 0.75,
      }).addTo(map);
      return;
    }

    markerRef.current.setLatLng(latLng);
  }, [center, value]);

  return (
    <div className="overflow-hidden rounded-md border">
      <div ref={mapElementRef} className="h-64 w-full" />
    </div>
  );
}
