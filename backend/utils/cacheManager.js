import crypto from "crypto";

const localMemoryCache = new Map();

export function setMemoryValue(key, value, ttlMs = 600000) {
  const expiresAt = Date.now() + ttlMs;
  localMemoryCache.set(key, { value, expiresAt });
}

export function getMemoryValue(key) {
  if (!localMemoryCache.has(key)) return null;
  const record = localMemoryCache.get(key);
  if (Date.now() > record.expiresAt) {
    localMemoryCache.delete(key);
    return null;
  }
  return record.value;
}

export function makeMD5Hash(dataString) {
  return crypto.createHash("md5").update(dataString).digest("hex");
}
