export async function ldestssOxigraphRoute(req, res, sparqlQuery, OXIGRAPH_BASE_URL_LDESTSS) {
  const queryEndpoint = `${OXIGRAPH_BASE_URL_LDESTSS.replace(/\/$/, '')}/query?query=${encodeURIComponent(sparqlQuery)}`;

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

    // 1. Get variable names dynamically from the SPARQL header
    const variables = result.head?.vars || [];

    // 2. Map through bindings dynamically
    const formattedData = result.results.bindings.map(binding => {
      const row = {};
      
      variables.forEach(varName => {
        const data = binding[varName];
        if (data) {
          const rawValue = data.value;

          // A. Check for Numeric Types (Casting strings to numbers)
          const isNumeric = data.datatype && (
            data.datatype.includes('integer') || 
            data.datatype.includes('decimal') || 
            data.datatype.includes('float') || 
            data.datatype.includes('double')
          );

          if (isNumeric) {
            row[varName] = parseFloat(rawValue);
          } 
          // B. Handle JSON strings (Generic detection for LDESTSS 'points')
          else if (typeof rawValue === 'string' && (rawValue.startsWith('[') || rawValue.startsWith('{'))) {
            try {
              row[varName] = JSON.parse(rawValue);
            } catch (e) {
              row[varName] = rawValue; // Fallback if it's just a bracketed string
            }
          } 
          // C. Standard String/URI
          else {
            row[varName] = rawValue;
          }
        } else {
          // Ensure keys exist even if null for table alignment
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