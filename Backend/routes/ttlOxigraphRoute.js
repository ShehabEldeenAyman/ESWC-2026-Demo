export async function ttlOxigraphRoute(req, res, sparqlQuery, OXIGRAPH_BASE_URL) {
  const queryEndpoint = `${OXIGRAPH_BASE_URL.replace(/\/$/, '')}/query?query=${encodeURIComponent(sparqlQuery)}`;

  try {
    const response = await fetch(queryEndpoint, {
      method: 'GET',
      headers: { 'Accept': 'application/sparql-results+json' }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }

    const result = await response.json();
    
    // 1. Get the list of variables from the SPARQL header (e.g., ["subject", "value", "time"])
    const variables = result.head?.vars || [];

    // 2. Map through bindings dynamically
    const formattedData = result.results.bindings.map(binding => {
      const row = {};
      
      variables.forEach(varName => {
        const data = binding[varName];
        if (data) {
          // Check if it's a numeric type or looks like a number to parse it
          const isNumeric = data.datatype && (
            data.datatype.includes('integer') || 
            data.datatype.includes('decimal') || 
            data.datatype.includes('float') || 
            data.datatype.includes('double')
          );

          // If numeric, parse as float; otherwise return the raw string value
          row[varName] = isNumeric ? parseFloat(data.value) : data.value;
        } else {
          // If the variable wasn't bound (e.g., in an OPTIONAL pattern), set to null
          row[varName] = null;
        }
      });
      
      return row;
    });

    // We remove the strict .filter() used previously so that rows with 
    // optional missing data are still returned to the frontend.
    return res.status(200).json(formattedData);

  } catch (error) {
    console.error("Error in ttlOxigraphRoute:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}