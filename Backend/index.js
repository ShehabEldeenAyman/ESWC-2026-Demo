import express from 'express';
import cors from 'cors'
import {OXIGRAPH_BASE_URL_LDESTSS,RiverStage1YearTSSquery,RiverDischarge1YearTSSquery,data_url_LDESTSS} from './constants/LDESTSSquery.js'
import {OXIGRAPH_BASE_URL_LDES,RiverDischarge1YearLDESquery,RiverStage1YearLDESquery,data_url_LDES} from './constants/LDESquery.js'
import {ldestssOxigraphRoute} from './routes/ldestssOxigraphRoute.js'
import { ldesOxigraphRoute } from './routes/ldesOxigraphRoute.js';
import {OxigraphHandler} from './models/OxigraphHandler.js'
import { VirtuosoHandler } from './models/VirtuosoHandler.js';
import {ldesVirtuosoRoute} from './routes/ldesVirtuosoRoute.js';
import {ldestssVirtuosoRoute} from './routes/ldestssVirtuosoRoute.js';
import {ingestBenchmarks,recallBenchmarks,objectcountBenchmarks } from './routes/benchmarks.js';
import {OxigraphTTLHandler} from './models/OxigraphTTLHandler.js';
import {CSV_URL,ttl_URL,OXIGRAPH_BASE_URL_TTL,data_url_TTL,VIRTUOSO_URL} from './constants/constants.js';
import {VirtuosoTTLHandler} from './models/VirtuosoTTLHandler.js';
import {ttlVirtuosoRoute} from './routes/ttlVirtuosoRoute.js';
import {RiverDischarge1YearTTLqueryVirtuoso,RiverStage1YearTTLqueryVirtuoso,RiverDischarge1YearTTLqueryOxigraph,RiverStage1YearTTLqueryOxigraph} from './constants/TTLquery.js'
import { ttlOxigraphRoute } from './routes/ttlOxigraphRoute.js';
import { cacheMiddleware } from './cache.js';
import { postgresHandler } from './models/PostgresHandler.js';
import { csvPostgresRoute, runRecallPostgres } from './routes/csvPostgresRoute.js';
//--------------------------------------------------------------- All Queries
import {RiverDischarge1YearLDESqueryALL,RiverStage1YearLDESqueryALL} from './constants/LDESquery.js'
import {RiverDischarge1YearTSSqueryALL,RiverStage1YearTSSqueryALL} from './constants/LDESTSSquery.js'
import {RiverDischarge1YearTTLqueryOxigraphALL,RiverStage1YearTTLqueryOxigraphALL,RiverDischarge1YearTTLqueryVirtuosoALL,RiverStage1YearTTLqueryVirtuosoALL} from './constants/TTLquery.js'
//---------------------------------------------------------------
import {name_GRAPH_TTL,name_GRAPH_LDES,name_GRAPH_LDESTSS} from './constants/constants.js'

//---------------------------------------------------------------
const app = express();
const PORT = 3000;
var oxigraphLDES_ingest_time = null;
var oxigraphLDESTSS_ingest_time = null;
var oxigraphTTL_ingest_time = null;
var virtuosoLDES_ingest_time = null;
var virtuosoLDESTSS_ingest_time = null;
var virtuosoTTL_ingest_time = null;
var postgresCSV_ingest_time = null;
var oxigraphLDES_recall_time = null;
var oxigraphLDESTSS_recall_time = null;
var oxigraphTTL_recall_time = null;
var virtuosoLDES_recall_time = null;
var virtuosoLDESTSS_recall_time = null;
var virtuosoTTL_recall_time = null;
var postgresCSV_recall_time = null;

var virtuosoTTL_count = null;
var virtuosoLDES_count = null;
var virtuosoTSS_count = null;
var oxigraphTTL_count = null;
var oxigraphLDES_count = null;
var oxigraphTSS_count = null;
var deleteExisting = false; // Set to true to clear existing data before ingesting new data
app.use(express.json());
// Replace the simple cors() with this:
app.use(cors({
  origin: '*', // For development only. In production, specify your frontend URL
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Accept']
}));

// Helper function to handle pagination logic
const getPagination = (query) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 100; // Default to 100 items per page
    const offset = (page - 1) * limit;
    return { limit, offset };
};

// query via front end form

app.get('/virtuoso/ldes/query', cacheMiddleware, async (req, res) => {
    try {
        // 1. Force the limit to 100 and calculate offset based on page
        const DEFAULT_LIMIT = 100;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * DEFAULT_LIMIT;
        
        // 2. Extract the raw SPARQL query
        const baseQuery = req.query.query;

        if (!baseQuery) {
            return res.status(400).json({ error: "No SPARQL query provided." });
        }

        // 3. Construct the final query with forced pagination
        // We trim the query to ensure we don't have conflicting LIMIT/OFFSET clauses
        const finalQuery = `
            ${baseQuery}
            LIMIT ${DEFAULT_LIMIT}
            OFFSET ${offset}
        `;

        // 4. Execute using your existing Virtuoso route logic
        // VIRTUOSO_URL should be your SPARQL endpoint (e.g., http://localhost:8890/sparql)
        await ldesVirtuosoRoute(req, res, finalQuery, VIRTUOSO_URL);

    } catch (error) {
        console.error("Error in Virtuoso query route:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/virtuoso/ldestss/query', cacheMiddleware, async (req, res) => {
    try {
        // 1. Force the limit to 100 and calculate offset based on page
        const DEFAULT_LIMIT = 100;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * DEFAULT_LIMIT;
        
        // 2. Extract the raw SPARQL query
        const baseQuery = req.query.query;

        if (!baseQuery) {
            return res.status(400).json({ error: "No SPARQL query provided." });
        }

        // 3. Construct the final query with forced pagination
        // We trim the query to ensure we don't have conflicting LIMIT/OFFSET clauses
        const finalQuery = `
            ${baseQuery}
            LIMIT ${DEFAULT_LIMIT}
            OFFSET ${offset}
        `;

        // 4. Execute using your existing Virtuoso route logic
        // VIRTUOSO_URL should be your SPARQL endpoint (e.g., http://localhost:8890/sparql)
        await ldestssVirtuosoRoute(req, res, finalQuery, VIRTUOSO_URL);

    } catch (error) {
        console.error("Error in Virtuoso query route:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/virtuoso/ttl/query', cacheMiddleware, async (req, res) => {
    try {
        // 1. Force the limit to 100 and calculate offset based on page
        const DEFAULT_LIMIT = 100;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * DEFAULT_LIMIT;
        
        // 2. Extract the raw SPARQL query
        const baseQuery = req.query.query;

        if (!baseQuery) {
            return res.status(400).json({ error: "No SPARQL query provided." });
        }

        // 3. Construct the final query with forced pagination
        // We trim the query to ensure we don't have conflicting LIMIT/OFFSET clauses
        const finalQuery = `
            ${baseQuery}
            LIMIT ${DEFAULT_LIMIT}
            OFFSET ${offset}
        `;

        // 4. Execute using your existing Virtuoso route logic
        // VIRTUOSO_URL should be your SPARQL endpoint (e.g., http://localhost:8890/sparql)
        await ttlVirtuosoRoute(req, res, finalQuery, VIRTUOSO_URL);

    } catch (error) {
        console.error("Error in Virtuoso query route:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});




// --- PAGINATED ROUTES ---
// --- LDES ROUTES ---

app.get('/virtuoso/ldes/RiverStage1Year', cacheMiddleware, async (req, res) => { //done for all
    const { limit, offset } = getPagination(req.query);
    const query = RiverStage1YearLDESquery(limit, offset);
    await ldesVirtuosoRoute(req, res, query, VIRTUOSO_URL);
});

app.get('/virtuoso/ldes/RiverDischarge1Year', cacheMiddleware, async (req, res) => { //done for all
    const { limit, offset } = getPagination(req.query);
    const query = RiverDischarge1YearLDESquery(limit, offset);
    await ldesVirtuosoRoute(req, res, query, VIRTUOSO_URL);
});

app.get('/oxigraph/ldes/RiverStage1Year', cacheMiddleware, async (req, res) => {
    const { limit, offset } = getPagination(req.query);
    const query = RiverStage1YearLDESquery(limit, offset);
    await ldesOxigraphRoute(req, res, query, OXIGRAPH_BASE_URL_LDES);
});

app.get('/oxigraph/ldes/RiverDischarge1Year', cacheMiddleware, async (req, res) => {
    const { limit, offset } = getPagination(req.query);
    const query = RiverDischarge1YearLDESquery(limit, offset);
    await ldesOxigraphRoute(req, res, query, OXIGRAPH_BASE_URL_LDES);
});

// --- TSS ROUTES ---

app.get('/virtuoso/ldestss/RiverStage1Year', cacheMiddleware, async (req, res) => {
    const { limit, offset } = getPagination(req.query);
    const query = RiverStage1YearTSSquery(limit, offset);
    await ldestssVirtuosoRoute(req, res, query, VIRTUOSO_URL);
});

app.get('/virtuoso/ldestss/RiverDischarge1Year', cacheMiddleware, async (req, res) => {
    const { limit, offset } = getPagination(req.query);
    const query = RiverDischarge1YearTSSquery(limit, offset);
    await ldestssVirtuosoRoute(req, res, query, VIRTUOSO_URL);
});

app.get('/oxigraph/ldestss/RiverStage1Year', cacheMiddleware, async (req, res) => {
    const { limit, offset } = getPagination(req.query);
    const query = RiverStage1YearTSSquery(limit, offset);
    await ldestssOxigraphRoute(req, res, query, OXIGRAPH_BASE_URL_LDESTSS);
});

app.get('/oxigraph/ldestss/RiverDischarge1Year', cacheMiddleware, async (req, res) => {
    const { limit, offset } = getPagination(req.query);
    const query = RiverDischarge1YearTSSquery(limit, offset);
    await ldestssOxigraphRoute(req, res, query, OXIGRAPH_BASE_URL_LDESTSS);
});

// --- TTL ROUTES ---

app.get('/virtuoso/ttl/RiverStage1Year', cacheMiddleware, async (req, res) => {
    const { limit, offset } = getPagination(req.query);
    const query = RiverStage1YearTTLqueryVirtuoso(limit, offset);
    await ttlVirtuosoRoute(req, res, query, VIRTUOSO_URL);
});

app.get('/virtuoso/ttl/RiverDischarge1Year', cacheMiddleware, async (req, res) => {
    const { limit, offset } = getPagination(req.query);
    const query = RiverDischarge1YearTTLqueryVirtuoso(limit, offset);
    await ttlVirtuosoRoute(req, res, query, VIRTUOSO_URL);
});

app.get('/oxigraph/ttl/RiverStage1Year', cacheMiddleware, async (req, res) => {
    const { limit, offset } = getPagination(req.query);
    const query = RiverStage1YearTTLqueryOxigraph(limit, offset);
    await ttlOxigraphRoute(req, res, query, OXIGRAPH_BASE_URL_TTL);
});

app.get('/oxigraph/ttl/RiverDischarge1Year', cacheMiddleware, async (req, res) => {
    const { limit, offset } = getPagination(req.query);
    const query = RiverDischarge1YearTTLqueryOxigraph(limit, offset);
    await ttlOxigraphRoute(req, res, query, OXIGRAPH_BASE_URL_TTL);
});

// --- POSTGRES CSV ROUTES ---

app.get('/postgres/RiverDischarge1Year', async (req, res) => {
    try {
        const { limit, offset } = getPagination(req.query);
        const startDate = '2025-01-01T00:00:00Z';
        const endDate = '2025-12-31T23:59:59Z';
        
        const data = await csvPostgresRoute('River Discharge', startDate, endDate, limit, offset);
        res.json({
            count: data.length,
            page: (offset / limit) + 1,
            data: data
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/postgres/RiverStage1Year', async (req, res) => {
    try {
        const { limit, offset } = getPagination(req.query);
        const startDate = '2025-01-01T00:00:00Z';
        const endDate = '2025-12-31T23:59:59Z';
        
        const data = await csvPostgresRoute('River Stage', startDate, endDate, limit, offset);
        res.json({
            count: data.length,
            page: (offset / limit) + 1,
            data: data
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.get('/ingestbenchmarks', (req, res) => {
  ingestBenchmarks(req, res, oxigraphLDESTSS_ingest_time, oxigraphLDES_ingest_time, virtuosoLDESTSS_ingest_time, virtuosoLDES_ingest_time,oxigraphTTL_ingest_time,virtuosoTTL_ingest_time,postgresCSV_ingest_time);
});
app.get('/recallbenchmarks', (req, res) => {
  recallBenchmarks(req, res, oxigraphLDESTSS_recall_time, oxigraphLDES_recall_time, virtuosoLDESTSS_recall_time, virtuosoLDES_recall_time,oxigraphTTL_recall_time,virtuosoTTL_recall_time,postgresCSV_recall_time);
});

app.get('/csv', (req, res) => {
  // This will send a 302 redirect status to the browser
  res.redirect(CSV_URL);
});
app.get('/ttl', (req, res) => {
  // This will send a 302 redirect status to the browser
  res.redirect(ttl_URL);
});

async function startServer() {
   
try {

    console.log("Initializing LDESTSS data...");

    // 1. Define a helper to run the task, time it, and assign variables safely
const runIngest = async (name, handlerPromise, timeVarSetter) => {
    const start = Date.now();
    const count = await handlerPromise; // Wait only inside this helper
    const end = Date.now();
    const duration = (end - start) / 1000;
    
    // Update the specific time variable
    timeVarSetter(duration);
    console.log(`${name} ingestion finished! Total time: ${duration.toFixed(2)} seconds.`);
    
    return count;
};

// 2. Run ALL tasks sequentially, one after another
    console.log("Waiting for ingestion to complete...");
    const results = [];

    try {
        // 0: Oxigraph LDESTSS
        results.push(await runIngest("LDESTSS Oxigraph",
            OxigraphHandler(OXIGRAPH_BASE_URL_LDESTSS, data_url_LDESTSS, "LDESTSS", 7878, name_GRAPH_LDESTSS, deleteExisting),
            (t) => oxigraphLDESTSS_ingest_time = t
        ));
    } catch (err) { console.error("LDESTSS Oxigraph ingest failed:", err); results.push(0); }

    try {
        // 1: Oxigraph LDES
        results.push(await runIngest("LDES Oxigraph",
            OxigraphHandler(OXIGRAPH_BASE_URL_LDES, data_url_LDES, "LDES", 7879, name_GRAPH_LDES, deleteExisting),
            (t) => oxigraphLDES_ingest_time = t
        ));
    } catch (err) { console.error("LDES Oxigraph ingest failed:", err); results.push(0); }

    try {
        // 2: Virtuoso LDES
        results.push(await runIngest("LDES Virtuoso",
            VirtuosoHandler("http://localhost:8890/sparql-graph-crud", data_url_LDES, "LDES", name_GRAPH_LDES, deleteExisting),
            (t) => virtuosoLDES_ingest_time = t
        ));
    } catch (err) { console.error("LDES Virtuoso ingest failed:", err); results.push(0); }

    try {
        // 3: Virtuoso LDESTSS
        results.push(await runIngest("LDESTSS Virtuoso",
            VirtuosoHandler("http://localhost:8890/sparql-graph-crud", data_url_LDESTSS, "LDESTSS", name_GRAPH_LDESTSS, deleteExisting),
            (t) => virtuosoLDESTSS_ingest_time = t
        ));
    } catch (err) { console.error("LDESTSS Virtuoso ingest failed:", err); results.push(0); }

    try {
        // 4: TTL Oxigraph
        results.push(await runIngest("TTL Oxigraph",
            OxigraphTTLHandler(OXIGRAPH_BASE_URL_TTL, data_url_TTL, "TTL", 7877, name_GRAPH_TTL, deleteExisting),
            (t) => oxigraphTTL_ingest_time = t
        ));
    } catch (err) { console.error("TTL Oxigraph ingest failed:", err); results.push(0); }

    try {
        // 5: TTL Virtuoso
        results.push(await runIngest("TTL Virtuoso",
            VirtuosoTTLHandler("http://localhost:8890/sparql-graph-crud", data_url_TTL, "TTL", name_GRAPH_TTL, deleteExisting),
            (t) => virtuosoTTL_ingest_time = t
        ));
    } catch (err) { console.error("TTL Virtuoso ingest failed:", err); results.push(0); }

    try {
        // 6: Postgres CSV
        results.push(await runIngest("CSV Postgres",
            postgresHandler(CSV_URL),
            (t) => postgresCSV_ingest_time = t
        ));
    } catch (err) { console.error("CSV Postgres ingest failed:", err); results.push(0); }

    // Assign the returned counts to global variables based on the array order above
    oxigraphTSS_count = results[0];
    oxigraphLDES_count = results[1];
    virtuosoLDES_count = results[2];
    virtuosoTSS_count = results[3];
    oxigraphTTL_count = results[4];
    virtuosoTTL_count = results[5];
    // results[6] is Postgres count, if you need it later

    console.log("Ingestion fully complete. Starting Recall benchmarks...");

console.log("Initialization finished. Starting web server...");


    app.get('/benchmarks/objectcount', (req, res) => {
    // This wrapper ensures we grab the LATEST values of the variables 
    // from the top-level scope every time the user hits the endpoint.
    objectcountBenchmarks(
        req, 
        res, 
        virtuosoTTL_count, 
        virtuosoLDES_count, 
        virtuosoTSS_count, 
        oxigraphTTL_count, 
        oxigraphLDES_count, 
        oxigraphTSS_count
    );
});

//----------------------------------------------- BENCHMARK QUERIES ALL with mock req res
const mockReq = {}; 
const mockRes = {
    // Mock the status and json methods used in ldesVirtuosoRoute
    status: () => mockRes, 
    json: () => mockRes,
    text: () => mockRes
};

const runRecall = async (name, routeFn, query1, query2, url, timeSetter) => {
    const start = Date.now();
    
    // We keep these two sequential so we measure the total time 
    // for "Stage + Discharge" as one unit (like your original code).
    await routeFn(mockReq, mockRes, query1, url);
    await routeFn(mockReq, mockRes, query2, url);
    
    const duration = (Date.now() - start) / 1000;
    timeSetter(duration); // Update global variable
    console.log(`${name} recall finished! Total time: ${duration.toFixed(2)} seconds.`);
};

// --- Run ALL recall tasks sequentially, one after another ---
try {
    // --- Virtuoso Benchmarks ---
    await runRecall("Virtuoso LDES",
        ldesVirtuosoRoute,
        RiverStage1YearLDESqueryALL(),
        RiverDischarge1YearLDESqueryALL(),
        VIRTUOSO_URL,
        (t) => virtuosoLDES_recall_time = t
    );

    await runRecall("Virtuoso LDESTSS",
        ldestssVirtuosoRoute,
        RiverStage1YearTSSqueryALL(),
        RiverDischarge1YearTSSqueryALL(),
        VIRTUOSO_URL,
        (t) => virtuosoLDESTSS_recall_time = t
    );

    await runRecall("Virtuoso TTL",
        ttlVirtuosoRoute,
        RiverStage1YearTTLqueryVirtuosoALL(),
        RiverDischarge1YearTTLqueryVirtuosoALL(),
        VIRTUOSO_URL,
        (t) => virtuosoTTL_recall_time = t
    );

    // --- Oxigraph Benchmarks ---
    await runRecall("Oxigraph LDES",
        ldesOxigraphRoute,
        RiverStage1YearLDESqueryALL(),
        RiverDischarge1YearLDESqueryALL(),
        OXIGRAPH_BASE_URL_LDES,
        (t) => oxigraphLDES_recall_time = t
    );

    await runRecall("Oxigraph LDESTSS",
        ldestssOxigraphRoute,
        RiverStage1YearTSSqueryALL(),
        RiverDischarge1YearTSSqueryALL(),
        OXIGRAPH_BASE_URL_LDESTSS,
        (t) => oxigraphLDESTSS_recall_time = t
    );

    await runRecall("Oxigraph TTL",
        ttlOxigraphRoute,
        RiverStage1YearTTLqueryOxigraphALL(),
        RiverDischarge1YearTTLqueryOxigraphALL(),
        OXIGRAPH_BASE_URL_TTL,
        (t) => oxigraphTTL_recall_time = t
    );

    await runRecallPostgres("Postgres CSV", (t) => postgresCSV_recall_time = t);

} catch (err) {
    console.error("Error during recall benchmarks:", err);
    // You might want to decide if you want to crash here or continue starting the server
}

console.log("All benchmarks finished. Starting web server...");


    app.listen(PORT,'0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });


    //await ldesQueryTest1()

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}


startServer();