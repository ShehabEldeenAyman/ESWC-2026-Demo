import { createClient } from 'redis';

const client = createClient();

client.on('error', err => {
    // This will catch the ECONNREFUSED errors instead of crashing the app
    console.error('Redis Client Error:', err.message);
});

// Use a self-invoking function or just call connect without top-level await 
// to allow the rest of the server to start even if Redis is down.
(async () => {
    try {
        await client.connect();
        console.log("Connected to Redis successfully");

        // Clear the cache whenever the server starts/restarts
        await client.flushAll(); 
        console.log("Redis cache cleared for development");

        
    } catch (err) {
        console.error("Could not connect to Redis. Caching will be disabled.");
    }
})();

export const cacheMiddleware = async (req, res, next) => {
return next(); // Disable caching for development/testing. Remove this line to enable caching.

    const key = `cache:${req.originalUrl || req.url}`;

    // Ensure the client is open before trying to use it
    if (!client.isOpen) {
        console.warn("Redis is not connected. Skipping cache.");
        return next();
    }

    try {
        const cachedData = await client.get(key);
        if (cachedData) {
            console.log(`Cache Hit for: ${key}`);
            return res.status(200).json(JSON.parse(cachedData));
        }

        res.sendResponse = res.json;
        res.json = (body) => {
            client.setEx(key, 3600, JSON.stringify(body)).catch(e => console.error("Redis Set Error:", e));
            res.sendResponse(body);
        };
        
        next();
    } catch (err) {
        console.error("Redis middleware error:", err);
        next(); 
    }
};

// Export the client so you can use it in index.js for flushAll()
export default client;