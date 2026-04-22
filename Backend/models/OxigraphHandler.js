import { replicateLDES } from "ldes-client";
import { Writer } from "n3";

const BATCH_SIZE = 5000;

export async function OxigraphHandler(OXIGRAPH_URL, data_url, type, portno, graphName, deleteAndReplace = true) {
  if (!deleteAndReplace) {
    console.log(`${type} Oxigraph: skipping fetch and upload (delete=false).`);
    return 0;
  }

  console.log(`Starting ${type} Service stream...`);

  try {
    // 1. Clear existing data in Oxigraph
    await fetch(OXIGRAPH_URL, { method: 'DELETE' });
    console.log(`${type} Oxigraph store cleared on port ${portno}.`);

    const ldesClient = replicateLDES({
      url: data_url,
      fetchOptions: { redirect: "follow" }
    });

    const memberReader = ldesClient.stream({ materialize: true }).getReader();

    // 2. Stream into batches — upload and discard each batch to keep memory bounded
    let batch = [];
    let totalQuads = 0;
    const uniqueSubjects = new Set();
    let isFirstBatch = true;

    let result = await memberReader.read();
    while (!result.done) {
      for (const quad of result.value.quads) {
        batch.push(quad);
        uniqueSubjects.add(quad.subject.value);
      }

      if (batch.length >= BATCH_SIZE) {
        await uploadToOxigraph(batch, OXIGRAPH_URL, type, graphName, isFirstBatch);
        totalQuads += batch.length;
        console.log(`${type}: uploaded ${totalQuads} quads so far...`);
        batch.length = 0; // Free batch memory
        isFirstBatch = false;
      }

      result = await memberReader.read();
    }

    // Flush remaining quads
    if (batch.length > 0) {
      await uploadToOxigraph(batch, OXIGRAPH_URL, type, graphName, isFirstBatch);
      totalQuads += batch.length;
      batch.length = 0;
    }

    if (totalQuads > 0) {
      const objectCount = uniqueSubjects.size;
      console.log(`Found ${objectCount} unique objects (from ${totalQuads} total quads)`);
      console.log(`${type} upload successfully. object count: ${objectCount}`);
      return objectCount;
    } else {
      console.log("No data found to upload.");
      return 0;
    }

  } catch (error) {
    console.error(`Error in ${type} Service:`, error);
    throw error;
  }
}

async function uploadToOxigraph(quads, url, type, graphName, isFirstBatch) {
  try {
    const gspUrl = `${url}store?graph=${encodeURIComponent(graphName)}`;

    // Only clear the graph on the very first batch
    if (isFirstBatch) {
      await fetch(gspUrl, { method: 'DELETE' });
    }

    const writer = new Writer({ format: 'N-Triples' });

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
      method: 'POST', // POST appends — graph cleared only on first batch
      headers: { 'Content-Type': 'application/n-triples' },
      body: nTriples
    });

    if (!response.ok) throw new Error(`Oxigraph Error: ${response.statusText}`);

    console.log(`Successfully uploaded batch to Oxigraph graph: ${graphName}`);
  } catch (error) {
    console.error(`Error in uploadToOxigraph:`, error);
    throw error;
  }
}