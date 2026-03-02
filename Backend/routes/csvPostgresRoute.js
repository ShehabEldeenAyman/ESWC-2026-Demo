import { pool } from '../models/PostgresHandler.js';
export const csvPostgresRoute = async (featureName, startDate, endDate, limit, offset) => {
    const query = `
        SELECT time, val, feature 
        FROM river_data 
        WHERE feature = $1 
        AND time >= $2 
        AND time <= $3
        ORDER BY time ASC
        LIMIT $4 OFFSET $5
    `;
    const values = [featureName, startDate, endDate, limit, offset];
    const result = await pool.query(query, values);
    return result.rows;
};

export const runRecallPostgres = async (name, timeSetter) => {
    const start = Date.now();
    
    // We run both 'River Discharge' and 'River Stage' to match 
    // the behavior of the SPARQL benchmarks
    const limit = 10000000; // Using a high limit to simulate "all" data as per your queryALL logic
    const offset = 0;
    const startDate = '2025-01-01T00:00:00Z';
    const endDate = '2025-12-31T23:59:59Z';

    try {
        await csvPostgresRoute('River Discharge', startDate, endDate, limit, offset);
        await csvPostgresRoute('River Stage', startDate, endDate, limit, offset);
        
        const duration = (Date.now() - start) / 1000;
        timeSetter(duration);
        console.log(`${name} recall finished! Total time: ${duration.toFixed(2)} seconds.`);
    } catch (error) {
        console.error(`Error in ${name} recall:`, error);
    }
};