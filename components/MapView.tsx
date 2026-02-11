
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Search, MapPin, Navigation, Loader2, X } from 'lucide-react';

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

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

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
      const currentMapCenter = mapRef.current.getCenter();
      const dist = Math.sqrt(Math.pow(currentMapCenter.lat - center[0], 2) + Math.pow(currentMapCenter.lng - center[1], 2));
      
      if (dist > 0.001 && !isSelectMode) {
        mapRef.current.setView(center, zoom);
      }
    }

    const currentMap = mapRef.current;

    const timer = setTimeout(() => {
      currentMap.invalidateSize();
    }, 100);

    currentMap.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polygon) {
        currentMap.removeLayer(layer);
      }
    });

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
      setShowResults(false);
    };

    currentMap.on('click', handleMapClick);

    return () => {
      currentMap.off('click', handleMapClick);
      clearTimeout(timer);
    };
  }, [center, zoom, markers, polygons, isSelectMode, onSelectLocation]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setShowResults(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&addressdetails=1&limit=5&countrycodes=vn`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Lỗi tìm kiếm địa chỉ:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectResult = (res: any) => {
    const lat = parseFloat(res.lat);
    const lon = parseFloat(res.lon);
    if (mapRef.current) {
      mapRef.current.setView([lat, lon], 17);
      // Nếu là chế độ chọn điểm, có thể tự động chọn luôn điểm đó
      if (isSelectMode && onSelectLocation) {
        // onSelectLocation(lat, lon); // Mở comment nếu muốn tự động ghim điểm khi chọn kết quả tìm kiếm
      }
    }
    setShowResults(false);
    setSearchQuery(res.display_name);
  };

  return (
    <div className="relative w-full h-full border-t border-slate-100 group">
      <div ref={containerRef} className="w-full h-full z-0" />
      
      {/* Search Bar Overlay */}
      {isSelectMode && (
        <div className="absolute top-4 left-4 z-[1000] w-72 sm:w-80">
          <form onSubmit={handleSearch} className="relative shadow-2xl">
            <div className="flex items-center bg-white rounded-xl border-2 border-blue-500/30 overflow-hidden focus-within:border-blue-500 transition-all">
              <div className="pl-3 text-slate-400">
                {isSearching ? <Loader2 size={18} className="animate-spin text-blue-500" /> : <Search size={18} />}
              </div>
              <input 
                type="text" 
                placeholder="Tìm địa chỉ (VD: 123 Lê Lợi...)" 
                className="w-full px-3 py-2.5 text-sm outline-none font-medium text-slate-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowResults(searchResults.length > 0)}
              />
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={() => { setSearchQuery(''); setSearchResults([]); setShowResults(false); }}
                  className="pr-3 text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Dropdown Results */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden divide-y divide-slate-50 max-h-64 overflow-y-auto custom-scrollbar">
                {searchResults.map((res, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectResult(res)}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-start gap-3"
                  >
                    <MapPin size={16} className="text-blue-500 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate leading-tight mb-0.5">
                        {res.address.house_number || ''} {res.address.road || ''}
                      </p>
                      <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                        {res.display_name}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </form>
        </div>
      )}

      {isSelectMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[999] bg-blue-600 text-white px-6 py-2 rounded-full text-[10px] font-black shadow-xl border-2 border-white pointer-events-none uppercase tracking-wider flex items-center gap-2">
          <Navigation size={12} className="animate-pulse" /> Click bản đồ để ghim vị trí
        </div>
      )}
    </div>
  );
};

export default MapView;
