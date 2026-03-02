import { from as copyFrom } from 'pg-copy-streams';
import csv from 'csv-parser';
import axios from 'axios';
import pkg from 'pg';
import dotenv from 'dotenv';
import { Readable } from 'stream';

dotenv.config();
const { Pool } = pkg;

export const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

export const postgresHandler = async (url) => {
    try {
        // 1. Ensure table exists
        const createTableQuery = `
          CREATE TABLE IF NOT EXISTS river_data (
            id SERIAL PRIMARY KEY,
            time TIMESTAMPTZ,
            val FLOAT,
            feature TEXT
          );
        `;
        await pool.query(createTableQuery);
        
        // 2. Clear existing data
        await pool.query('TRUNCATE TABLE river_data RESTART IDENTITY CASCADE;');
        console.log("Table cleared. Starting high-speed COPY ingestion...");

        // 3. Fetch CSV as a stream
        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'stream'
        });

        // 4. Set up the Database Connection for Streaming
        const client = await pool.connect();

        try {
            const ingestStream = client.query(
                copyFrom('COPY river_data (time, val, feature) FROM STDIN WITH (FORMAT csv, HEADER false)')
            );

            // 5. Transform CSV rows into a format COPY understands (CSV-like strings)
            // We bypass the 'results' array entirely to save memory
            const transformer = new Readable({
                read() {}
            });

            response.data
                .pipe(csv())
                .on('data', (data) => {
                    const rawValue = data.Value ? data.Value.trim() : "";
                    const val = rawValue === "" ? "" : rawValue;
                    const feature = data.stationparameter_longname;
                    const timestamp = data.Timestamp;

                    // Push formatted CSV line to the transformer
                    // Format: "Timestamp,Value,Feature"
                    transformer.push(`${timestamp},${val},${feature}\n`);
                })
                .on('end', () => {
                    transformer.push(null); // End the stream
                })
                .on('error', (err) => {
                    transformer.emit('error', err);
                });

            // 6. Execute the pipe and wait for completion
            await new Promise((resolve, reject) => {
                transformer.pipe(ingestStream)
                    .on('finish', resolve)
                    .on('error', reject);
            });

            console.log("Postgres COPY ingestion complete.");
            
            // 7. Performance Boost: Create indexes AFTER ingestion
            console.log("Creating indexes for faster recall...");
            await client.query('CREATE INDEX IF NOT EXISTS idx_river_feature_time ON river_data (feature, time);');

        } finally {
            client.release();
        }

    } catch (error) {
        console.error("Error in postgresHandler:", error);
        throw error;
    }
};