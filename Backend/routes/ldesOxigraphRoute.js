export async function ldesOxigraphRoute(req, res, sparqlQuery, OXIGRAPH_BASE_URL_LDES) {
  const queryEndpoint = `${OXIGRAPH_BASE_URL_LDES.replace(/\/$/, '')}/query?query=${encodeURIComponent(sparqlQuery)}`;

  try {
    const response = await fetch(queryEndpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/sparql-results+json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }

    const result = await response.json();

    // 1. Get variable names dynamically from the SPARQL header
    const variables = result.head?.vars || [];

    // 2. Map through bindings dynamically
    const formattedData = result.results.bindings.map(binding => {
      const row = {};
      
      variables.forEach(varName => {
        const data = binding[varName];
        if (data) {
          // Identify numeric types for automatic type-casting
          const isNumeric = data.datatype && (
            data.datatype.includes('integer') || 
            data.datatype.includes('decimal') || 
            data.datatype.includes('float') || 
            data.datatype.includes('double')
          );

          row[varName] = isNumeric ? parseFloat(data.value) : data.value;
        } else {
          // Set to null if the variable is not bound (common in OPTIONAL patterns)
          // This ensures every row has the same keys for your dynamic table
          row[varName] = null;
        }
      });
      
      return row;
    });

    return res.status(200).json(formattedData);

  } catch (error) {
    console.error("Query Error:", error);
    return res.status(500).json({ error: error.message });
  }
}