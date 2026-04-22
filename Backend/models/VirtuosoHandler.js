import { replicateLDES } from "ldes-client";
import { Writer } from "n3";

const BATCH_SIZE = 5000;

export async function VirtuosoHandler(VIRTUOSO_URL, data_url, type, graphName, deleteAndReplace = true) {
  if (!deleteAndReplace) {
    console.log(`${type} Virtuoso: skipping fetch and upload (delete=false).`);
    return 0;
  }

  console.log(`Starting ${type} Virtuoso Service stream...`);
  console.log(`Targeting graph: ${graphName}`);

  try {
    const ldesClient = replicateLDES({
      url: data_url,
      fetchOptions: { redirect: "follow" }
    });

    const memberReader = ldesClient.stream({ materialize: true }).getReader();

    // 1. Stream into batches — upload and discard each batch to keep memory bounded
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
        await uploadToVirtuoso(batch, VIRTUOSO_URL, graphName, type, isFirstBatch);
        totalQuads += batch.length;
        console.log(`${type}: uploaded ${totalQuads} quads so far...`);
        batch.length = 0; // Free batch memory
        isFirstBatch = false;
      }

      result = await memberReader.read();
    }

    // Flush remaining quads
    if (batch.length > 0) {
      await uploadToVirtuoso(batch, VIRTUOSO_URL, graphName, type, isFirstBatch);
      totalQuads += batch.length;
      batch.length = 0;
    }

    if (totalQuads > 0) {
      const objectCount = uniqueSubjects.size;
      console.log(`Found ${objectCount} unique objects (from ${totalQuads} total quads)`);
      console.log(`${type} Virtuoso upload successful. object count: ${objectCount}`);
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

async function uploadToVirtuoso(quads, url, graphName, type, isFirstBatch) {
  try {
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

    // Only clear the graph on the very first batch
    if (isFirstBatch) {
      await fetch(gspUrl, { method: 'DELETE' });
      console.log(`Cleared Virtuoso graph: ${graphName}`);
    }

    const response = await fetch(gspUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/n-triples' },
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