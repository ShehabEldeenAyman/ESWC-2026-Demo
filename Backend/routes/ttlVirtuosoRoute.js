export async function ttlVirtuosoRoute(req, res, sparqlQuery, VIRTUOSO_SPARQL_URL) {
  const queryEndpoint = `${VIRTUOSO_SPARQL_URL}?query=${encodeURIComponent(sparqlQuery)}`;

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

    // 1. Get the list of variables from the SPARQL header (e.g., ["s", "p", "o"])
    const variables = result.head.vars;

    // 2. Map through bindings dynamically
    const formattedData = result.results.bindings.map(binding => {
      const row = {};
      
      variables.forEach(varName => {
        const data = binding[varName];
        if (data) {
          // Check if it's a numeric type to parse it, otherwise return raw value
          const isNumeric = data.datatype && (
            data.datatype.includes('integer') || 
            data.datatype.includes('decimal') || 
            data.datatype.includes('float') || 
            data.datatype.includes('double')
          );

          row[varName] = isNumeric ? parseFloat(data.value) : data.value;
        } else {
          row[varName] = null;
        }
      });
      
      return row;
    });

    return res.status(200).json(formattedData);

  } catch (error) {
    console.error("Error in VirtuosoTTLRoute:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}