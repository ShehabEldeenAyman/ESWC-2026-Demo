

export async function ingestBenchmarks(req, res, oxigraphLDESTSS_time, oxigraphLDES_time, virtuosoLDESTSS_time, virtuosoLDES_time,oxigraphTTL_time,virtuosoTTL_time,postgresCSV_time, deleteAndReplace = true) {
   
   
   
    try {
        // Validation: Ensure the benchmark times are actually provided
        // if (oxigraphLDES_time === undefined || virtuosoLDES_time === undefined || oxigraphLDESTSS_time === undefined || virtuosoLDESTSS_time === undefined || oxigraphTTL_time === undefined) {
        //     throw new Error("Missing benchmark data.");
        // }

        res.status(200).json({
            oxigraph_time_series: oxigraphLDESTSS_time,
            oxigraph_standard_ldes: oxigraphLDES_time,
            virtuoso_time_series: virtuosoLDESTSS_time,
            virtuoso_standard_ldes: virtuosoLDES_time,
            oxigraph_ttl: oxigraphTTL_time,
            virtuoso_ttl: virtuosoTTL_time,
            postgres_csv_ingestion: postgresCSV_time

        });
    } catch (error) {
        console.error("Error in benchmarks route:", error.message);
        
        // Return a 500 Internal Server Error status so the frontend knows it failed
        res.status(500).json({ 
            error: "Failed to retrieve benchmark data.",
            message: error.message 
        });
    }
}


export async function recallBenchmarks(req, res,oxigraphLDES_recall_time, virtuosoLDES_recall_time, oxigraphLDESTSS_recall_time, virtuosoLDESTSS_recall_time,oxigraphTTL_recall_time,virtuosoTTL_recall_time,postgresCSV_recall_time, deleteAndReplace = true) {
    try {
        // Validation: Ensure the benchmark times are actually provided
        // if (oxigraphLDES_time === undefined || virtuosoLDES_time === undefined || oxigraphLDESTSS_time === undefined || virtuosoLDESTSS_time === undefined || oxigraphTTL_time === undefined) {
        //     throw new Error("Missing benchmark data.");
        // }

        res.status(200).json({
            oxigraph_time_series: oxigraphLDESTSS_recall_time,
            oxigraph_standard_ldes: oxigraphLDES_recall_time,
            virtuoso_time_series: virtuosoLDESTSS_recall_time,
            virtuoso_standard_ldes: virtuosoLDES_recall_time,
            oxigraph_ttl: oxigraphTTL_recall_time,
            virtuoso_ttl: virtuosoTTL_recall_time,
            postgres_csv_recall: postgresCSV_recall_time
            //postgres_csv_ingestion: postgresCSV_time

        });
    } catch (error) {
        console.error("Error in benchmarks route:", error.message);
        
        // Return a 500 Internal Server Error status so the frontend knows it failed
        res.status(500).json({ 
            error: "Failed to retrieve benchmark data.",
            message: error.message 
        });
    }
}

export async function objectcountBenchmarks(req, res,virtuosoTTL_count,virtuosoLDES_count,virtuosoTSS_count,oxigraphTTL_count,oxigraphLDES_count,oxigraphTSS_count, deleteAndReplace = true) {
    try {
        // Validation: Ensure the benchmark times are actually provided
        // if (oxigraphLDES_time === undefined || virtuosoLDES_time === undefined || oxigraphLDESTSS_time === undefined || virtuosoLDESTSS_time === undefined || oxigraphTTL_time === undefined) {
        //     throw new Error("Missing benchmark data.");
        // }

        res.status(200).json({
            virtuoso_ttl: virtuosoTTL_count,
            virtuoso_standard_ldes: virtuosoLDES_count,
            virtuoso_time_series: virtuosoTSS_count,
            oxigraph_ttl: oxigraphTTL_count,
            oxigraph_standard_ldes: oxigraphLDES_count,
            oxigraph_time_series: oxigraphTSS_count,
        });
    } catch (error) {
        console.error("Error in benchmarks route:", error.message);
        
        // Return a 500 Internal Server Error status so the frontend knows it failed
        res.status(500).json({ 
            error: "Failed to retrieve benchmark data.",
            message: error.message 
        });
    }
}