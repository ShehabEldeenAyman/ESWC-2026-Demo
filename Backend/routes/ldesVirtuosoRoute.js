export async function ldesVirtuosoRoute(req, res, sparqlQuery, VIRTUOSO_SPARQL_URL) {
  // Virtuoso typically expects queries via a 'query' parameter on its SPARQL endpoint.
  const queryEndpoint = `${VIRTUOSO_SPARQL_URL}?query=${encodeURIComponent(sparqlQuery)}`;

  try {
    const response = await fetch(queryEndpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/sparql-results+json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Virtuoso Error: ${response.status} - ${errorText}`);
      return res.status(response.status).json({ error: errorText });
    }

    const result = await response.json();

    // 1. Extract variable names from the SPARQL header (e.g., ["s", "p", "o"] or ["subject", "value"])
    const variables = result.head?.vars || [];

    // 2. Map the results dynamically based on the variables found in the query
    const formattedData = result.results.bindings.map(binding => {
      const row = {};
      
      variables.forEach(varName => {
        const data = binding[varName];
        if (data) {
          // Identify numeric types to perform automatic type-casting
          const isNumeric = data.datatype && (
            data.datatype.includes('integer') || 
            data.datatype.includes('decimal') || 
            data.datatype.includes('float') || 
            data.datatype.includes('double')
          );

          row[varName] = isNumeric ? parseFloat(data.value) : data.value;
        } else {
          // Set to null if the variable is not bound (common in OPTIONAL patterns)
          row[varName] = null;
        }
      });
      
      return row;
    });

    return res.status(200).json(formattedData);

  } catch (error) {
    console.error("Error in ldesVirtuosoRoute:", error);
    return res.status(500).json({ error: "Internal Server Error while querying Virtuoso." });
  }
}