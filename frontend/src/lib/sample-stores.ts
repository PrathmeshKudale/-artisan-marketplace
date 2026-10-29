/**
 * Small set of sample artisan stores around Pune for local dev fallback.
 * Kept intentionally minimal and safe (no external dependencies).
 */

const PUNE_CENTER = { lat: 18.5204, lng: 73.8567 };

// Generate a set of sample stores programmatically to produce more markers for the UI.
const SAMPLE_STORES = [] as any[];
const craftNames = [
  'Deccan Clayworks Studio','Indigo Loom Textiles','Warli Art Collective','Teak & Carve','Sutra Jewellery Studio',
  'Blue River Pottery','Mulmul Handlooms','Karu Silverworks','Bambusa Cane Studio','Stoneform Sculptures',
  'Glass Prism Studio','Terraclay Crafts','PaperSoul Art','BlockPrint House','Forestline Woodcrafts',
  'Resham Weaves','Nomad Leatherworks','Brassline Metalcraft','Palette Paintings','Matka Pottery'
];

for (let i = 0; i < craftNames.length; i++) {
  // Spread stores using polar random distribution so points cover a wider area (up to ~25 km)
  const maxKm = 25; // maximum distance from center in kilometers
  const rnd = Math.random();
  // sqrt random for uniform area distribution
  const distanceKm = Math.sqrt(rnd) * maxKm;
  const theta = Math.random() * Math.PI * 2;
  // degrees per km approx
  const degPerKmLat = 1 / 111.0;
  const degPerKmLng = 1 / (111.0 * Math.cos((PUNE_CENTER.lat * Math.PI) / 180));
  const deltaLat = distanceKm * degPerKmLat * Math.sin(theta);
  const deltaLng = distanceKm * degPerKmLng * Math.cos(theta);
  const lat = PUNE_CENTER.lat + deltaLat;
  const lng = PUNE_CENTER.lng + deltaLng;

  SAMPLE_STORES.push({
    id: `sample-place-${i + 1}`,
    placeId: `sample-place-${i + 1}`,
    name: craftNames[i],
    position: { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) },
    address: `Shop ${i + 1}, Pune, Maharashtra, India`,
    rating: Number((3.8 + Math.random() * 1.4).toFixed(1)),
    userRatingsTotal: 20 + Math.floor(Math.random() * 400),
    openingHours: 'Mon-Sun 10:00 AM - 7:00 PM',
    contact: `+91 98${Math.floor(100000000 + Math.random()*899999999)}`,
    website: null,
    craftTypes: [(i % 6 === 0) ? 'pottery' : (i % 6 === 1) ? 'textiles' : (i % 6 === 2) ? 'jewelry' : (i % 6 === 3) ? 'woodwork' : (i % 6 === 4) ? 'painting' : 'metalwork'],
    reviews: [{ authorName: 'Visitor', rating: Math.round(4 + Math.random()), text: 'Lovely handcrafted items and friendly artisans.', relativeTime: 'recently' }]
  });
}

export default SAMPLE_STORES;
