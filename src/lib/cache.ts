

interface CacheEntry<T> {
    value: T;
    expiry: number; 
}

const cache = new Map<string, CacheEntry<any>>();

export const getFromCache = <T>(key: string): T | undefined => {
    const entry = cache.get(key);
    if (!entry) {
        return undefined;
    }
    if (Date.now() > entry.expiry) {
        cache.delete(key); 
        return undefined;
    }
    return entry.value;
};

export const setInCache = <T>(key: string, value: T, ttlSeconds: number): void => {
    const expiry = Date.now() + ttlSeconds * 1000;
    cache.set(key, { value, expiry });
};

export const clearCache = (key?: string): void => {
    if (key) {
        cache.delete(key);
    } else {
        cache.clear();
    }
};
