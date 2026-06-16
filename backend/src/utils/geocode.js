const NominatimHeaders = {
  'User-Agent': 'UniWORK/1.0 (https://github.com/VIVEKSADHU/uniwork)',
  Accept: 'application/json'
};

async function geocodeCity(city) {
  const normalizedCity = typeof city === 'string' ? city.trim() : '';

  if (!normalizedCity) {
    throw new Error('City is required for geocoding');
  }

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(normalizedCity)}`,
    { headers: NominatimHeaders }
  );

  if (!response.ok) {
    throw new Error('Failed to geocode city');
  }

  const results = await response.json();
  const match = results?.[0];

  if (!match) {
    throw new Error('City could not be geocoded');
  }

  return {
    lat: Number(match.lat),
    lng: Number(match.lon),
    displayName: match.display_name
  };
}

module.exports = { geocodeCity };