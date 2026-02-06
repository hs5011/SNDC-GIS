
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

const setupLeafletIcons = () => {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
};

interface MapViewProps {
  center: [number, number];
  zoom?: number;
  markers?: Array<{ id: string; lat: number; lng: number; label: string }>;
  polygons?: Array<{ id: string; points: Array<[number, number]>; label: string; color?: string }>;
  onSelectLocation?: (lat: number, lng: number) => void;
  isSelectMode?: boolean;
}

const MapView: React.FC<MapViewProps> = ({ 
  center, 
  zoom = 15, 
  markers = [], 
  polygons = [],
  onSelectLocation,
  isSelectMode = false 
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastCenterRef = useRef<[number, number] | null>(null);

  useEffect(() => {
    setupLeafletIcons();
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current, {
        zoomControl: false
      }).setView(center, zoom);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(mapRef.current);

      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);
      lastCenterRef.current = center;
    } else {
      // CHỈ re-center nếu tọa độ tâm thay đổi đáng kể (không phải do click thêm điểm)
      const currentMapCenter = mapRef.current.getCenter();
      const dist = Math.sqrt(Math.pow(currentMapCenter.lat - center[0], 2) + Math.pow(currentMapCenter.lng - center[1], 2));
      
      // Nếu khoảng cách thay đổi lớn (> 0.001) mới nhảy tâm
      if (dist > 0.001 && !isSelectMode) {
        mapRef.current.setView(center, zoom);
      }
    }

    const currentMap = mapRef.current;

    // Chỉ invalidateSize khi khởi tạo hoặc resize, tránh gọi liên tục
    const timer = setTimeout(() => {
      currentMap.invalidateSize();
    }, 100);

    // Xóa layer cũ hiệu quả hơn bằng cách dùng group hoặc lọc
    currentMap.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polygon) {
        currentMap.removeLayer(layer);
      }
    });

    // Vẽ Polygons trước để marker đè lên trên
    polygons.forEach(p => {
      if (p.points && p.points.length > 2) {
        const poly = L.polygon(p.points, {
          color: p.color || '#3b82f6',
          fillColor: p.color || '#3b82f6',
          fillOpacity: 0.35,
          weight: 2
        }).addTo(currentMap);
        
        poly.bindTooltip(p.label, {
          permanent: true,
          direction: 'center',
          className: 'bg-white/80 border-none shadow-sm text-[10px] font-bold p-1 rounded pointer-events-none'
        }).openTooltip();
      }
    });

    // Vẽ Markers
    markers.forEach(m => {
      if (!isNaN(m.lat) && !isNaN(m.lng)) {
        L.marker([m.lat, m.lng])
          .addTo(currentMap)
          .bindPopup(`<div class="p-1 font-bold text-slate-800">${m.label}</div>`);
      }
    });

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (isSelectMode && onSelectLocation) {
        onSelectLocation(e.latlng.lat, e.latlng.lng);
      }
    };

    currentMap.on('click', handleMapClick);

    return () => {
      currentMap.off('click', handleMapClick);
      clearTimeout(timer);
    };
  }, [center, zoom, markers, polygons, isSelectMode, onSelectLocation]);

  return (
    <div className="relative w-full h-full border-t border-slate-100">
      <div ref={containerRef} className="w-full h-full z-0" />
      {isSelectMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-blue-600 text-white px-6 py-2 rounded-full text-[10px] font-bold shadow-xl border-2 border-white pointer-events-none uppercase tracking-wider">
          Click để thêm điểm ranh giới
        </div>
      )}
    </div>
  );
};

export default MapView;
