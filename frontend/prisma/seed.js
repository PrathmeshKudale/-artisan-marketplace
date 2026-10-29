// Seed 100 Pune artisan stores into SQLite using Prisma
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PUNE = { lat: 18.5204, lng: 73.8567 };

function jitter(base, maxOffsetKm) {
  // ~111km per degree latitude; adjust lng by cos(lat)
  const kmToDegLat = maxOffsetKm / 111;
  const kmToDegLng = maxOffsetKm / (111 * Math.cos((PUNE.lat * Math.PI) / 180));
  const lat = base.lat + (Math.random() * 2 - 1) * kmToDegLat;
  const lng = base.lng + (Math.random() * 2 - 1) * kmToDegLng;
  return { lat, lng };
}

const craftPools = ['pottery','textiles','jewelry','woodwork','painting','leather','metalwork','bamboo','weaving','stone','glass','terracotta','papier-mache','block-print','warli'];

const craftNameParts = {
  pottery: {
    prefixes: ['Deccan','Kumbhar','Blue River','Clayfield','Shilp','Matka','Agnikala','Sutra','Pune Clay','Narmada','Studio'],
    nouns: ['Clay','Pottery','Ceramics','Terracotta','Earthenware','Mud Art','Clayworks','Pottery House','Pottery Studio'],
    suffixes: ['Atelier','Studio','Collective','Workshop','Guild','Handmade','Crafts','House']
  },
  textiles: {
    prefixes: ['Mulmul','Silk Route','KhadiGram','Indigo','Threadscape','Banarasi','Paithani','Gul','Resham','Sutradhar'],
    nouns: ['Textiles','Loom','Handloom','Weaves','Fabrics','Stitch','Tailor','Dye Works','Block Print'],
    suffixes: ['Studio','Boutique','Handloom','Works','Collective','Co-op']
  },
  jewelry: {
    prefixes: ['Karu','Silverleaf','Zewar','Meenakari','Sunstone','Gilded','Aabharan','Heirloom','Ratna'],
    nouns: ['Jewels','Jewelry','Ornament','Kada','Beads','Silversmiths','Goldsmiths','Baubles'],
    suffixes: ['Workshop','Crafts','Studio','House','Gallery']
  },
  woodwork: {
    prefixes: ['Sandal','Deodar','Cane & Wood','Carver’s','Forestline','Teak Roots','Bamboo Wood'],
    nouns: ['Woodworks','Carvings','Joinery','Woodcrafts','Timber','Handcarved','Furniture'],
    suffixes: ['Atelier','Workshop','Yard','Makers','Guild']
  },
  painting: {
    prefixes: ['Warli','Madhubani','Kalamkari','Chitrakala','Rang','Rasa','Aakruti','Palette','Indigo'],
    nouns: ['Art','Paintings','Canvas','Arts','Gallery','Fresco'],
    suffixes: ['Studio','Collective','House','Workshop']
  },
  leather: {
    prefixes: ['Hide & Hue','Kutchi','TanCraft','Solely','Nomad','Brown Bear','Saddle'],
    nouns: ['Leather','Goods','Handbags','Footwear','Belts','Crafts'],
    suffixes: ['Works','Workshop','House','Studio']
  },
  metalwork: {
    prefixes: ['Bell Metal','Brassline','Panchdhatu','MetalMorph','Tamra','Shilp Metals'],
    nouns: ['Metalworks','Brass','Copper','Casting','Inlay','Damascene'],
    suffixes: ['Foundry','Workshop','House','Crafts']
  },
  bamboo: {
    prefixes: ['Bambusa','GreenWeave','Eco Cane','CaneCraft','Tribal','Sahyadri Bamboo'],
    nouns: ['Bamboo','Cane','Weaves','Basketry','Crafts'],
    suffixes: ['Collective','Workshop','House','Studio']
  },
  weaving: {
    prefixes: ['Loomline','Warp & Weft','Resham','Charkha','Handloom Pune'],
    nouns: ['Weaves','Loom','Textiles','Handloom','Shawls','Scarves'],
    suffixes: ['Studio','Works','Collective','Co-op']
  },
  stone: {
    prefixes: ['Basalt','Stonefield','Deccan Stone','Chisel & Form','Carvers’'],
    nouns: ['Stonecraft','Sculpture','Carvings','Idols','Stoneworks'],
    suffixes: ['Atelier','Workshop','Yard','Gallery']
  },
  glass: {
    prefixes: ['Crystaline','Kanch','Glassline','Prism','Molten'],
    nouns: ['Glassworks','Fusing','Blown Glass','Stained Glass','Glass Art'],
    suffixes: ['Studio','Atelier','Works','Gallery']
  },
  terracotta: {
    prefixes: ['Red Earth','Mruttika','Terraclay','Matika','Prithvi'],
    nouns: ['Terracotta','Clay Idols','Planters','Tiles','Artefacts'],
    suffixes: ['Studio','Workshop','House','Collective']
  },
  'papier-mache': {
    prefixes: ['PaperSoul','Naqqashi','Kagaz','Papier','Lacquer'],
    nouns: ['Papier-mâché','Artefacts','Boxes','Decor','Crafts'],
    suffixes: ['Studio','House','Workshop','Collective']
  },
  'block-print': {
    prefixes: ['Ajrakh','Bagru','Dabu','Indigo','Chhipa'],
    nouns: ['Block Print','Print House','Textiles','Yardage','Fabrics'],
    suffixes: ['Studio','Works','Workshop','Handloom']
  },
  warli: {
    prefixes: ['Warli','Tribal Lines','Sahyadri Warli','Vanvas','Pithora'],
    nouns: ['Art','Painting','Murals','Canvas','Artefacts'],
    suffixes: ['Studio','Collective','House','Gallery']
  }
};

function craftTags(main) {
  const count = 1 + Math.floor(Math.random() * 2);
  const picks = new Set([main]);
  while (picks.size < count) picks.add(craftPools[Math.floor(Math.random() * craftPools.length)]);
  return Array.from(picks).join(',');
}

function generateName(craft) {
  const parts = craftNameParts[craft] || craftNameParts.pottery;
  const p = parts.prefixes[Math.floor(Math.random() * parts.prefixes.length)];
  const n = parts.nouns[Math.floor(Math.random() * parts.nouns.length)];
  const s = parts.suffixes[Math.floor(Math.random() * parts.suffixes.length)];
  return `${p} ${n} ${s}`;
}

async function main() {
  const data = [];
  for (let i = 1; i <= 100; i++) {
    const pos = jitter(PUNE, 10); // within ~10km radius
    const mainCraft = craftPools[Math.floor(Math.random() * craftPools.length)];
    data.push({
      placeId: `seed-place-${i}`,
      name: generateName(mainCraft),
      address: `Shop ${i}, Pune, Maharashtra, India`,
      lat: pos.lat,
      lng: pos.lng,
      rating: Math.round((3 + Math.random() * 2) * 10) / 10, // 3.0 - 5.0
      userRatingsTotal: 10 + Math.floor(Math.random() * 500),
      openingHours: 'Mon-Sun 10:00 AM - 8:00 PM',
      contact: `+91 98${Math.floor(100000000 + Math.random()*899999999)}`,
      website: null,
      craftTypes: craftTags(mainCraft),
    });
  }

  // Upsert stores
  for (const s of data) {
    const store = await prisma.store.upsert({
      where: { placeId: s.placeId },
      create: s,
      update: {
        name: s.name,
        address: s.address,
        lat: s.lat,
        lng: s.lng,
        rating: s.rating,
        userRatingsTotal: s.userRatingsTotal,
        openingHours: s.openingHours,
        contact: s.contact,
        website: s.website,
        craftTypes: s.craftTypes,
      },
    });

    // Seed 1-2 short reviews per store
    const reviewCount = 1 + Math.floor(Math.random() * 2);
    await prisma.review.deleteMany({ where: { storeId: store.id } });
    for (let r = 0; r < reviewCount; r++) {
      await prisma.review.create({
        data: {
          storeId: store.id,
          authorName: `Visitor ${r + 1}`,
          rating: 4 + Math.floor(Math.random() * 2),
          text: 'Lovely handcrafted items and friendly artisans.',
          relativeTime: 'recently',
        },
      });
    }
  }

  console.log('Seeded 100 Pune artisan stores.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


