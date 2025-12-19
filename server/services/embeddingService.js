let embedder = null;

async function getEmbedder() {
  if (!embedder) {
    const { pipeline } = await import('@xenova/transformers');

    embedder = await pipeline(
      'feature-extraction',
      'sentence-transformers/all-MiniLM-L6-v2'
    );
  }
  return embedder;
}

async function embedText(text) {
  const model = await getEmbedder();

  const output = await model(text, {
    pooling: 'mean',
    normalize: true
  });

  // MongoDB non supporta Float32Array
  return Array.from(output.data);
}

module.exports = {
  embedText
};
