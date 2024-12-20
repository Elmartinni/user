const cache = new Map();

export const withCache = async (key, fn, ttl = 5 * 60 * 1000) => {
  const cached = cache.get(key);
  if (cached && cached.timestamp > Date.now() - ttl) {
    return cached.data;
  }
  
  const data = await fn();
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
  
  return data;
}; 