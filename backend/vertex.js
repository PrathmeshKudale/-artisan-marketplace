const axios = require('axios');
const path = require('path');
const fs = require('fs');
const { GoogleAuth } = require('google-auth-library');

// Helper to get access token using service account JSON (or application default creds)
async function getAccessToken() {
  const saPath = process.env.FIREBASE_ADMIN_SA_PATH || path.resolve(__dirname, './config/serviceAccountKey.json');
  let keyFile = null;
  if (fs.existsSync(saPath)) {
    keyFile = saPath;
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  }

  const auth = new GoogleAuth({ keyFilename: keyFile, scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  if (!tokenResponse) throw new Error('Unable to retrieve access token');
  return tokenResponse.token || tokenResponse;
}

// Create an embedding for text using Vertex AI (model name should be set in env VERTEX_EMBEDDING_MODEL)
// Returns a float[] embedding
async function embedText({ projectId, location, model, text }) {
  if (!projectId || !location || !model) throw new Error('Missing Vertex embedding config');
  const token = await getAccessToken();

  // Build endpoint URL - region-specific
  // Example: https://us-central1-aiplatform.googleapis.com/v1/projects/{projectId}/locations/{location}/models/{model}:embedText
  const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/models/${model}:embedText`;

  try {
    const body = { instances: [{ content: text }] };
    const resp = await axios.post(url, body, { headers: { Authorization: `Bearer ${token}` } });
    // Try common shapes
    if (resp.data?.data?.[0]?.embedding) return resp.data.data[0].embedding;
    if (resp.data?.embeddings?.[0]?.values) return resp.data.embeddings[0].values;
    if (resp.data?.predictions?.[0]) return resp.data.predictions[0];
    // Try flattened values
    if (Array.isArray(resp.data)) return resp.data[0];
    return resp.data;
  } catch (err) {
    console.error('Vertex embedText error:', err.response?.data || err.message || err);
    throw err;
  }
}

// Call Matching Engine index endpoint to match an embedding.
// indexEndpointName: the index endpoint resource id (e.g. indexEndpoints/{endpointId}) or just endpointId
async function matchIndex({ projectId, location, indexEndpointId, deployedIndexId, embedding, numNeighbors = 6 }) {
  if (!projectId || !location || !indexEndpointId || !deployedIndexId) throw new Error('Missing Matching Engine config');
  const token = await getAccessToken();

  // POST https://{location}-aiplatform.googleapis.com/v1/projects/{projectId}/locations/{location}/indexEndpoints/{indexEndpointId}:match
  const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/indexEndpoints/${indexEndpointId}:match`;
  try {
    const body = {
      deployedIndexId: deployedIndexId,
      queries: [
        {
          embedding: { values: embedding },
          neighborCount: numNeighbors
        }
      ]
    };

    const resp = await axios.post(url, body, { headers: { Authorization: `Bearer ${token}` } });
    return resp.data;
  } catch (err) {
    console.error('Matching Engine match error:', err.response?.data || err.message || err);
    throw err;
  }
}

// Helper: Cosine similarity between vectors
function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
    throw new Error('Invalid vectors for similarity calculation');
  }

  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

  return dot / (normA * normB + 1e-6); // Small epsilon to prevent division by 0
}

// Cache embeddings to avoid recalculating within a session
const embeddingCache = new Map();
function cacheKey(text) {
  return Buffer.from(text).toString('base64');
}

// Get embedding with caching
async function getCachedEmbedding(text, opts) {
  const key = cacheKey(text);
  if (embeddingCache.has(key)) {
    return embeddingCache.get(key);
  }
  const embedding = await embedText({ ...opts, text });
  embeddingCache.set(key, embedding);
  return embedding;
}

module.exports = {
  embedText,
  matchIndex,
  getAccessToken,
  cosineSimilarity,
  getCachedEmbedding,
  embeddingCache,
  cacheKey
};
