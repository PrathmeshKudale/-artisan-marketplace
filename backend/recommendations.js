const admin = require('firebase-admin');
const { getCachedEmbedding, cosineSimilarity } = require('./vertex');

/**
 * Get artwork recommendations using Vertex AI embeddings and similarity search
 * @param {Object} artwork The source artwork to get recommendations for
 * @returns {Promise<Array>} Array of recommended artworks
 */
async function getRecommendations(artwork) {
  try {
    // Format artwork data for embedding
    const text = [
      artwork.name || '',
      artwork.description || '',
      artwork.category || '',
      artwork.artistName || artwork.artist || '',
      artwork.state || '',
      artwork.tags?.join(' ') || ''
    ].filter(Boolean).join(' ');

    // Get embedding for the source artwork
    const sourceEmbedding = await getCachedEmbedding(text, {
      projectId: process.env.GCP_PROJECT,
      location: process.env.GCP_LOCATION,
      model: process.env.VERTEX_MODEL_ID
    });

    // Get embeddings collection (if we're storing them)
    const embSnap = await admin.firestore().collection('embeddings').get();
    const storedEmbeddings = embSnap.docs.map(d => ({
      id: d.id,
      artworkId: d.data().artworkId,
      vector: d.data().vector
    }));

    // Score candidates using cosine similarity
    const scored = storedEmbeddings
      .filter(e => e.artworkId !== artwork.id)
      .map(e => ({
        id: e.artworkId,
        score: cosineSimilarity(sourceEmbedding, e.vector)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    // Get full artwork details for the recommendations
    const artworksRef = admin.firestore().collection('artworks');
    const recommendedDocs = await Promise.all(
      scored.map(s => artworksRef.doc(s.id).get())
    );

    const recommendations = recommendedDocs
      .filter(doc => doc.exists)
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          artistName: data.artistName || data.artist || null,
          image: (data.images && data.images[0]) || data.image || null,
          price: data.price || null
        };
      })
      .slice(0, 4); // Return top 4 recommendations

    if (recommendations.length > 0) {
      return recommendations;
    }

    // If no recommendations found through embeddings, try category-based fallback
    throw new Error('No embedding-based recommendations found');

  } catch (error) {
    console.error('Vertex AI recommendations error:', error);
    throw error;
  }
}

/**
 * Fallback to category/state based recommendations if Vertex AI fails
 * @param {Object} artwork The source artwork
 * @param {Array} allArtworks All available artworks
 * @returns {Array} Array of recommended artworks
 */
async function getFallbackRecommendations(artwork, allArtworks) {
  // Filter by same category first
  const sameCategory = allArtworks.filter(a => 
    a.id !== artwork.id && a.category === artwork.category
  );

  // Then by same state
  const sameState = allArtworks.filter(a => 
    a.id !== artwork.id && a.state === artwork.state && a.category !== artwork.category
  );

  // Then others in a different category and state
  const others = allArtworks.filter(a => 
    a.id !== artwork.id && 
    a.category !== artwork.category && 
    a.state !== artwork.state
  );

  // Prioritize and combine recommendations
  const recommendations = [
    ...sameCategory,
    ...sameState,
    ...others
  ]
  .slice(0, 4)
  .map(a => ({
    id: a.id,
    name: a.name,
    artistName: a.artistName || a.artist || null,
    image: (a.images && a.images[0]) || a.image || null,
    price: a.price || null,
    score: a.category === artwork.category ? 1.0 :
           a.state === artwork.state ? 0.8 : 0.5
  }));

  return recommendations;
}

module.exports = {
  getRecommendations,
  getFallbackRecommendations
};