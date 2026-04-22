import { Parser, Writer, DataFactory } from "n3";
const { namedNode } = DataFactory;

const BATCH_SIZE = 5000;

export async function OxigraphTTLHandler(OXIGRAPH_URL, fileUrl, type, portno, graphName, deleteAndReplace = true) {
    if (!deleteAndReplace) {
    console.log(`${type} OxigraphTTL: skipping fetch and upload (delete=false).`);
    return 0;
  }

  console.log(`Starting ${type} Service: Fetching TTL from URL...`);

  try {
    // 1. Clear existing graph
    const deleteUrl = `${OXIGRAPH_URL.endsWith('/') ? OXIGRAPH_URL : OXIGRAPH_URL + '/'}store?graph=${encodeURIComponent(graphName)}`;
    await fetch(deleteUrl, { method: 'DELETE' });
    console.log(`${type} Oxigraph graph ${graphName} cleared.`);

    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error(`Failed to fetch TTL file: ${response.statusText}`);
    const ttlData = await response.text();

    const parser = new Parser({ format: 'Turtle' });

    // 2. Parse all quads — parser is synchronous/callback-based so we collect them first,
    //    then upload in batches and discard each batch to keep peak memory low.
    const allQuads = [];
    await new Promise((resolve, reject) => {
      parser.parse(ttlData, (error, quad) => {
        if (error) reject(error);
        if (quad) {
          allQuads.push(DataFactory.quad(quad.subject, quad.predicate, quad.object, namedNode(graphName)));
        } else {
          resolve();
        }
      });
    });

    if (allQuads.length === 0) return 0;

    const uniqueSubjects = new Set(allQuads.map(q => q.subject.value));
    const objectCount = uniqueSubjects.size;

    // 3. Upload in batches, freeing each batch from allQuads as we go
    console.log(`Uploading ${allQuads.length} quads to ${type} Oxigraph graph: ${graphName}`);
    let totalUploaded = 0;
    while (allQuads.length > 0) {
      const batch = allQuads.splice(0, BATCH_SIZE); // removes from front, freeing memory
      await uploadToOxigraph(batch, OXIGRAPH_URL, graphName);
      totalUploaded += batch.length;
      console.log(`${type}: uploaded ${totalUploaded} quads so far...`);
    }

    console.log(`${type} upload successfully. object count: ${objectCount}`);
    return objectCount;

  } catch (error) {
    console.error(`Error in ${type} Service:`, error);
    throw error;
  }
}

async function uploadToOxigraph(quads, url, graphName) {
  const writer = new Writer({ format: 'N-Quads' });
  writer.addQuads(quads);

  const nQuads = await new Promise((resolve, reject) => {
    writer.end((error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
  });

  const uploadUrl = url.endsWith('/') ? `${url}store` : `${url}/store`;
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/n-quads' },
    body: nQuads
  });

  if (!response.ok) throw new Error(`Oxigraph upload failed: ${await response.text()}`);
}