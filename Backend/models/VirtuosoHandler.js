import { replicateLDES } from "ldes-client";
import { Writer } from "n3";

export async function VirtuosoHandler(VIRTUOSO_URL, data_url, type, graphName) {
  console.log(`Starting ${type} Virtuoso Service stream...`);
  const allQuads = [];

  try {
    console.log(`Targeting graph: ${graphName}`);

    const ldesClient = replicateLDES({
      url: data_url,
      fetchOptions: { redirect: "follow" }
    });

    const memberReader = ldesClient.stream({ materialize: true }).getReader();

    // 1. Accumulate all data
    let result = await memberReader.read();
    while (!result.done) {
      allQuads.push(...result.value.quads);
      result = await memberReader.read();
    }

    // 2. Count unique objects (subjects)
    if (allQuads.length > 0) {
      const uniqueSubjects = new Set(allQuads.map(q => q.subject.value));
      const objectCount = uniqueSubjects.size;

      console.log(`Found ${objectCount} unique objects (from ${allQuads.length} total quads)`);
      
      console.log(`Uploading to ${type} Virtuoso graph: ${graphName}`);
      await uploadToVirtuoso(allQuads, VIRTUOSO_URL, graphName, type);
      
      console.log(`${type} Virtuoso upload successful.`);
      
      // Return the count for benchmarking purposes
      console.log(`object count: ${objectCount}`);
      return objectCount;
    } else {
      console.log("No data found to upload.");
      return 0;
    }

  } catch (error) {
    console.error(`Error in ${type} Virtuoso Service:`, error);
    throw error;
  }
}
async function uploadToVirtuoso(quads, url, graphName, type) {
  try {
    // 1. IMPORTANT: Map Quads to Triples by removing the graph component.
    // Virtuoso GSP ?graph= endpoint only accepts N-Triples (3 components).
    const triplesOnly = quads.map(q => ({
      subject: q.subject,
      predicate: q.predicate,
      object: q.object
    }));

    const writer = new Writer({ format: 'N-Triples' });
    writer.addQuads(triplesOnly);

    const nTriples = await new Promise((resolve, reject) => {
      writer.end((error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });

    const gspUrl = `${url}?graph=${encodeURIComponent(graphName)}`;
    
    //console.log(`Sending data to Virtuoso GSP: ${gspUrl}`);
    // --- ADDED: CLEAR THE SPECIFIC GRAPH FIRST ---
    // This ensures no old data remains in this specific graph
    await fetch(gspUrl, { method: 'DELETE' });
    console.log(`Cleared Virtuoso graph: ${graphName}`);


    const response = await fetch(gspUrl, {
      method: 'POST', 
      headers: { 
        'Content-Type': 'application/n-triples', 
      },
      body: nTriples
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Virtuoso responded with ${response.status}: ${errorText}`);
    }
  } catch (error) {
    console.error(`Failed to upload ${type} to Virtuoso:`, error.message);
    throw error;
  }
}