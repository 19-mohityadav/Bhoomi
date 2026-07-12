export const formatCoordinates = (coordsStr) => {
  if (!coordsStr) return '0° N, 0° E';
  
  let coords = coordsStr;
  if (typeof coordsStr === 'string') {
    try {
      coords = JSON.parse(coordsStr);
    } catch (e) {
      return coordsStr;
    }
  }
  
  if (Array.isArray(coords) && coords.length > 0) {
    const lat = coords[0].lat?.toFixed(4) || coords[0][0]?.toFixed(4) || 0;
    const lng = coords[0].lng?.toFixed(4) || coords[0][1]?.toFixed(4) || 0;
    return `${lat}°, ${lng}° (Polygon)`;
  }

  return String(coordsStr);
};

export const parsePolygon = (coordsStr) => {
  if (!coordsStr) return null;
  if (Array.isArray(coordsStr)) return coordsStr;
  if (typeof coordsStr === 'string') {
    try {
      const coords = JSON.parse(coordsStr);
      if (Array.isArray(coords)) return coords;
    } catch (e) {
      return null;
    }
  }
  return null;
};
