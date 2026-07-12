import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons issue in React/Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const MapDraw = ({ 
  isInteractive = true, 
  onMapClick, 
  points = [], // Array of up to 4 {lat, lng} objects or null
  existingPolygonCoords = null, // JSON array/object of coordinates for read-only view
  height = '400px'
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const shapesGroupRef = useRef(null);

  // Stable references for callback to avoid re-binding map event listeners
  const onMapClickRef = useRef(onMapClick);
  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

  // 1. Initialize Map and Base Layers (Only once)
  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstanceRef.current) return;

    // Initialize Map defaults to India centroid
    const map = L.map(mapRef.current, {
      doubleClickZoom: false
    }).setView([20.5937, 78.9629], 5);
    
    mapInstanceRef.current = map;

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // Feature group to hold markers and polygons
    const shapesGroup = new L.FeatureGroup();
    map.addLayer(shapesGroup);
    shapesGroupRef.current = shapesGroup;

    // Direct Click Listener
    if (isInteractive) {
      map.on('click', (e) => {
        if (onMapClickRef.current) {
          onMapClickRef.current(e.latlng);
        }
      });
      
      // Auto locate user location
      map.locate({ setView: true, maxZoom: 15 });
    }

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isInteractive]);

  // 2. Render Markers and Connecting Lines/Polygon
  useEffect(() => {
    if (!mapInstanceRef.current || !shapesGroupRef.current) return;
    
    const map = mapInstanceRef.current;
    const shapesGroup = shapesGroupRef.current;

    // Clear previous drawings
    shapesGroup.clearLayers();

    // Determine which coordinates to display
    const displayPoints = (existingPolygonCoords && existingPolygonCoords.length > 0)
      ? existingPolygonCoords
      : (points || []).filter(p => p !== null && p !== undefined);

    if (displayPoints.length === 0) return;

    const latlngs = displayPoints.map(p => [p.lat, p.lng]);

    // Plot markers for each point
    displayPoints.forEach((pt, idx) => {
      const marker = L.circleMarker([pt.lat, pt.lng], {
        radius: 8,
        color: '#00EEFC', // Bhoomi Primary Cyber Cyan
        fillColor: '#090D16', // Sleek dark fill
        fillOpacity: 0.9,
        weight: 3,
      }).addTo(shapesGroup);

      // Tooltip to denote Point numbers (P1, P2, etc.)
      marker.bindTooltip(`P${idx + 1}`, {
        permanent: true,
        direction: 'top',
        className: '!bg-slate-950 !text-[#00EEFC] !border-[#00EEFC]/30 !shadow-lg text-[10px] font-bold px-2 py-0.5 rounded font-mono',
        offset: [0, -8]
      });
    });

    // Draw lines/polygon to connect points
    if (displayPoints.length >= 3) {
      // Connect 3 or 4 points into a closed polygon
      const polygon = L.polygon(latlngs, {
        color: '#00EEFC',
        fillColor: '#00EEFC',
        fillOpacity: 0.15,
        weight: 3,
        dashArray: '5, 5',
      }).addTo(shapesGroup);

      // Zoom to fit the polygon bounds
      const bounds = polygon.getBounds();
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    } else if (displayPoints.length === 2) {
      // Connect 2 points with a dotted line
      const polyline = L.polyline(latlngs, {
        color: '#00EEFC',
        weight: 3,
        dashArray: '5, 5',
      }).addTo(shapesGroup);

      const bounds = polyline.getBounds();
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    } else if (displayPoints.length === 1) {
      // Center view on single point
      map.setView(latlngs[0], 16);
    }

  }, [points, existingPolygonCoords]);

  return (
    <div 
      ref={mapRef} 
      style={{ height, width: '100%', borderRadius: '8px', zIndex: 1 }}
      className="border border-outline-variant/20 shadow-inner"
    />
  );
};

export default MapDraw;
