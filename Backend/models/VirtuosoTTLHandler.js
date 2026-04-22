import { Parser, Writer } from "n3";

const BATCH_SIZE = 5000;

export async function VirtuosoTTLHandler(VIRTUOSO_URL, fileUrl, type, graphName, deleteAndReplace = true) {
  if (!deleteAndReplace) {
    console.log(`${type} Virtuoso TTL: skipping fetch and upload (delete=false).`);
    return 0;
  }

  console.log(`Starting ${type} Virtuoso TTL Service: Fetching from ${fileUrl}...`);

  try {
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error(`Failed to fetch TTL file: ${response.statusText}`);
    const ttlData = await response.text();

    const parser = new Parser({ format: 'Turtle' });
    const allQuads = [];
    await new Promise((resolve, reject) => {
      parser.parse(ttlData, (error, quad) => {
        if (error) reject(error);
        if (quad) {
          allQuads.push(quad);
        } else {
          resolve();
        }
      });
    });

    if (allQuads.length === 0) return 0;

    const uniqueSubjects = new Set(allQuads.map(q => q.subject.value));
    const objectCount = uniqueSubjects.size;

    // Clear the graph once upfront
    const gspUrl = `${VIRTUOSO_URL}?graph=${encodeURIComponent(graphName)}`;
    await fetch(gspUrl, { method: 'DELETE' });

    console.log(`Found ${objectCount} unique objects (from ${allQuads.length} total quads)`);
    console.log(`Uploading to ${type} Virtuoso graph: ${graphName}`);

    // Upload in batches, splicing from the front to free memory as we go
    let totalUploaded = 0;
    while (allQuads.length > 0) {
      const batch = allQuads.splice(0, BATCH_SIZE);
      await uploadToVirtuoso(batch, VIRTUOSO_URL, graphName);
      totalUploaded += batch.length;
      console.log(`${type}: uploaded ${totalUploaded} quads so far...`);
    }

    console.log(`${type} Virtuoso TTL upload successful. object count: ${objectCount}`);
    return objectCount;

  } catch (error) {
    console.error(`Error in ${type} Virtuoso TTL Service:`, error);
    throw error;
  }
}

async function uploadToVirtuoso(quads, url, graphName) {
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
    const response = await fetch(gspUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/n-triples' },
      body: nTriples
    });

    if (!response.ok) throw new Error(`Virtuoso error: ${await response.text()}`);
}