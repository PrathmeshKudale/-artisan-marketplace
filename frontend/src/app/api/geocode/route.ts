import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-static';

// Server-side proxy for reverse geocoding using the server-only key
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const lat = params.get('lat');
  const lng = params.get('lng');

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Missing lat/lng' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY || '';
  if (!apiKey) {
    console.error('Missing server-side GOOGLE_MAPS_API_KEY');
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${encodeURIComponent(lat)},${encodeURIComponent(lng)}&key=${encodeURIComponent(apiKey)}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      const txt = await res.text();
      console.error('Geocoding API error', res.status, txt);
      return NextResponse.json({ error: 'Geocoding API error', status: res.status, body: txt }, { status: 502 });
    }

    const data = await res.json();

    // Find administrative_area_level_1 (state) in address components
    let stateName = '';
    for (const result of data.results || []) {
      for (const comp of result.address_components || []) {
        if (comp.types && comp.types.includes('administrative_area_level_1')) {
          stateName = comp.long_name || comp.short_name || '';
          break;
        }
      }
      if (stateName) break;
    }

    // Fallback: try locality/political or other levels
    if (!stateName) {
      for (const result of data.results || []) {
        for (const comp of result.address_components || []) {
          if (comp.types && (comp.types.includes('locality') || comp.types.includes('political') || comp.types.includes('administrative_area_level_2'))) {
            stateName = comp.long_name || comp.short_name || '';
            break;
          }
        }
        if (stateName) break;
      }
    }

    // Final fallback: try to match a known state name from the formatted address string
    const KNOWN_STATES = [
      'Maharashtra','Karnataka','Tamil Nadu','Kerala','Andhra Pradesh','Telangana','Gujarat','Rajasthan','Madhya Pradesh','Uttar Pradesh','Bihar','West Bengal','Odisha','Jharkhand','Chhattisgarh','Punjab','Haryana','Himachal Pradesh','Uttarakhand','Assam','Tripura','Meghalaya','Manipur','Mizoram','Nagaland','Arunachal Pradesh','Sikkim','Goa','Delhi'
    ];
    let matchedBy = stateName ? 'component' : 'none';
    if (!stateName && Array.isArray(data.results) && data.results.length > 0) {
      const formatted = String(data.results[0].formatted_address || '').toLowerCase();
      for (const s of KNOWN_STATES) {
        if (formatted.includes(s.toLowerCase())) {
          stateName = s;
          matchedBy = 'formatted_address';
          break;
        }
      }
    }

    // Nearest-center fallback: when Google doesn't return an administrative_area_level_1, use the
    // nearest approximate state center (coarse but reliable for India) based on geometry or input lat/lng
    if (!stateName) {
      const STATE_CENTERS: Record<string, { lat: number; lng: number }> = {
        'Maharashtra': { lat: 19.7515, lng: 75.7139 },
        'Karnataka': { lat: 15.3173, lng: 75.7139 },
        'Tamil Nadu': { lat: 11.1271, lng: 78.6569 },
        'Kerala': { lat: 10.8505, lng: 76.2711 },
        'Andhra Pradesh': { lat: 15.9129, lng: 79.7400 },
        'Telangana': { lat: 18.1124, lng: 79.0193 },
        'Gujarat': { lat: 23.0225, lng: 72.5714 },
        'Rajasthan': { lat: 27.0238, lng: 74.2179 },
        'Madhya Pradesh': { lat: 22.9734, lng: 78.6569 },
        'Uttar Pradesh': { lat: 26.8467, lng: 80.9462 },
        'Bihar': { lat: 25.0961, lng: 85.3131 },
        'West Bengal': { lat: 22.9868, lng: 87.8550 },
        'Odisha': { lat: 20.9517, lng: 85.0985 },
        'Jharkhand': { lat: 23.6102, lng: 85.2799 },
        'Chhattisgarh': { lat: 21.2787, lng: 81.8661 },
        'Punjab': { lat: 31.1471, lng: 75.3412 },
        'Haryana': { lat: 29.0588, lng: 76.0856 },
        'Himachal Pradesh': { lat: 31.1048, lng: 77.1734 },
        'Uttarakhand': { lat: 30.0668, lng: 79.0193 },
        'Assam': { lat: 26.2006, lng: 92.9376 },
        'Tripura': { lat: 23.9408, lng: 91.9882 },
        'Meghalaya': { lat: 25.4670, lng: 91.3662 },
        'Manipur': { lat: 24.6637, lng: 93.9063 },
        'Mizoram': { lat: 23.1645, lng: 92.9376 },
        'Nagaland': { lat: 26.1584, lng: 94.5624 },
        'Arunachal Pradesh': { lat: 28.2180, lng: 94.7278 },
        'Sikkim': { lat: 27.5330, lng: 88.5122 },
        'Goa': { lat: 15.2993, lng: 74.1240 },
        'Delhi': { lat: 28.7041, lng: 77.1025 }
      };

      let latNum: number | null = null;
      let lngNum: number | null = null;
      if (Array.isArray(data.results) && data.results[0]?.geometry?.location) {
        latNum = Number(data.results[0].geometry.location.lat);
        lngNum = Number(data.results[0].geometry.location.lng);
      }
      if ((latNum === null || Number.isNaN(latNum)) && request.nextUrl.searchParams.get('lat')) {
        latNum = Number(request.nextUrl.searchParams.get('lat'));
        lngNum = Number(request.nextUrl.searchParams.get('lng'));
      }

      if (latNum !== null && !Number.isNaN(latNum) && lngNum !== null && !Number.isNaN(lngNum)) {
        const toRad = (deg: number) => deg * Math.PI / 180;
        const R = 6371; // km
        let best = { name: '', dist: Infinity };
        for (const [name, c] of Object.entries(STATE_CENTERS)) {
          const dLat = toRad(c.lat - latNum);
          const dLng = toRad(c.lng - lngNum);
          const a = Math.sin(dLat/2) ** 2 + Math.cos(toRad(latNum)) * Math.cos(toRad(c.lat)) * Math.sin(dLng/2) ** 2;
          const cAng = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const dist = R * cAng;
          if (dist < best.dist) {
            best = { name, dist };
          }
        }
        if (best.name) {
          stateName = best.name;
          matchedBy = 'nearest_center_fallback';
        }
      }
    }

    return NextResponse.json({ state: stateName || null, matchedBy, googleStatus: data.status || null, raw: data }, { headers: { 'Cache-Control': 'public, max-age=300' } });
  } catch (err) {
    console.error('Reverse geocoding failed', err);
    return NextResponse.json({ error: 'Reverse geocoding failed', details: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
