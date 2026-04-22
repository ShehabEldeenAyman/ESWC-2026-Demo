import { replicateLDES } from "ldes-client";
import { Writer } from "n3";

export async function OxigraphHandler(OXIGRAPH_URL, data_url, type, portno, graphName, deleteAndReplace = true) {
  if (!deleteAndReplace) {
    console.log(`${type} Oxigraph: skipping fetch and upload (delete=false).`);
    return 0;
  }

  console.log(`Starting ${type} Service stream...`);
  const allQuads = [];

  try {
    // 1. Clear existing data in Oxigraph
    await fetch(OXIGRAPH_URL, {
      method: 'DELETE'
    });
    console.log(`${type} Oxigraph store cleared on port ${portno}.`);

    const ldesClient = replicateLDES({
      url: data_url,
      fetchOptions: { redirect: "follow" }
    });

    const memberReader = ldesClient.stream({ materialize: true }).getReader();

    // 2. Accumulate all data
    let result = await memberReader.read();
    while (!result.done) {
      allQuads.push(...result.value.quads);
      result = await memberReader.read();
    }

    // 3. Calculate unique object count and perform upload
    if (allQuads.length > 0) {
      // --- COUNT LOGIC ---
      const uniqueSubjects = new Set(allQuads.map(q => q.subject.value));
      const objectCount = uniqueSubjects.size;

      console.log(`Found ${objectCount} unique objects (from ${allQuads.length} total quads)`);
      console.log(`Uploading to ${type} Oxigraph on port ${portno}`);
      
      await uploadToOxigraph(allQuads, OXIGRAPH_URL, type, graphName);
      console.log(`${type} upload successfully.`);
      console.log(`object count: ${objectCount}`);
      // Return the count for the benchmark suite
      return objectCount;
    } else {
      console.log("No data found to upload.");
      return 0;
    }

  } catch (error) {
    console.error(`Error in ${type} Service:`, error);
    throw error; // Ensure the error is bubbled up to the benchmark runner
  }
}

async function uploadToOxigraph(quads, url, type, graphName) {
try {
    // Standard Oxigraph GSP endpoint with the graph parameter
    const gspUrl = `${url}store?graph=${encodeURIComponent(graphName)}`;

    // Clear the specific graph first (equivalent to what we added for Virtuoso)
    await fetch(gspUrl, { method: 'DELETE' });

    // Use N-Quads to ensure graph consistency, or N-Triples if targeting a single graph via URL
    const writer = new Writer({ format: 'N-Triples' }); 
    
    // Map quads to triples because the GSP ?graph= parameter handles the graph assignment
    const triplesOnly = quads.map(q => ({
      subject: q.subject,
      predicate: q.predicate,
      object: q.object
    }));
    writer.addQuads(triplesOnly);

    const nTriples = await new Promise((resolve, reject) => {
      writer.end((error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });

    const response = await fetch(gspUrl, {      
      method: 'POST', // Use PUT to replace the graph content
      headers: { 'Content-Type': 'application/n-triples' },
      body: nTriples
    });

    if (!response.ok) throw new Error(`Oxigraph Error: ${response.statusText}`);
    
    console.log(`Successfully uploaded to Oxigraph graph: ${graphName}`);
  } catch (error) {
    console.error(`Error in uploadToOxigraph:`, error);
    throw error;
  }
}