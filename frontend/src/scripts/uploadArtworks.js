const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');
const artworks = require('../data/artworks.json');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || process.env.FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function uploadArtworks() {
  console.log('Starting artwork upload...');
  
  try {
    const artworksRef = collection(db, 'artworks');
    
    for (const artwork of artworks) {
      // Convert numerical id to string and ensure all required fields
      const processedArtwork = {
        ...artwork,
        id: artwork.id.toString(),
        name: artwork.name || 'Untitled',
        description: artwork.description || `Beautiful ${artwork.category} from ${artwork.state}`,
        artistName: artwork.artist,
        stockCount: artwork.stockCount || 10,
        images: artwork.images || [artwork.image],
        reviewsCount: artwork.reviews || 0
      };
      
      // Add to Firestore
      const docRef = await addDoc(artworksRef, processedArtwork);
      console.log(`✅ Uploaded artwork "${artwork.name}" with ID: ${docRef.id}`);
    }
    
    console.log('✨ All artworks uploaded successfully!');
  } catch (error) {
    console.error('❌ Error uploading artworks:', error);
  }
}

// Run the upload
uploadArtworks();
