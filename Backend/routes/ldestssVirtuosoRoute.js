export async function ldestssVirtuosoRoute(req, res, sparqlQuery, VIRTUOSO_SPARQL_URL) {
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

    // 1. Get the list of variables from the SPARQL header
    const variables = result.head?.vars || [];

    // 2. Map through bindings dynamically
    const formattedData = result.results.bindings.map(binding => {
      const row = {};
      
      variables.forEach(varName => {
        const data = binding[varName];
        if (data) {
          const rawValue = data.value;

          // Smart Parsing Logic:
          // A. Handle Numeric Types
          const isNumeric = data.datatype && (
            data.datatype.includes('integer') || 
            data.datatype.includes('decimal') || 
            data.datatype.includes('float') || 
            data.datatype.includes('double')
          );

          if (isNumeric) {
            row[varName] = parseFloat(rawValue);
          } 
          // B. Handle JSON strings (like 'points' array)
          else if (typeof rawValue === 'string' && (rawValue.startsWith('[') || rawValue.startsWith('{'))) {
            try {
              row[varName] = JSON.parse(rawValue);
            } catch (e) {
              row[varName] = rawValue; // Fallback to string if JSON parse fails
            }
          } 
          // C. Standard String/URI
          else {
            row[varName] = rawValue;
          }
        } else {
          row[varName] = null; // Ensure key exists for dynamic table consistency
        }
      });
      
      return row;
    });

    return res.status(200).json(formattedData);

  } catch (error) {
    console.error("Error in ldestssVirtuosoRoute:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}