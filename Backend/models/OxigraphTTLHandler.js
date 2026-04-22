import { Parser, Writer, DataFactory } from "n3";
const { namedNode } = DataFactory;

export async function OxigraphTTLHandler(OXIGRAPH_URL, fileUrl, type, portno, graphName, deleteAndReplace = true) {
    if (!deleteAndReplace) {
    console.log(`${type} OxigraphTTL: skipping fetch and upload (delete=false).`);
    return 0;
  }

  console.log(`Starting ${type} Service: Fetching TTL from URL...`);
  const allQuads = [];

  try {
    // 1. Clear existing data in the specific graph in Oxigraph
    const deleteUrl = `${OXIGRAPH_URL.endsWith('/') ? OXIGRAPH_URL : OXIGRAPH_URL + '/'}store?graph=${encodeURIComponent(graphName)}`;
    await fetch(deleteUrl, { method: 'DELETE' });
    console.log(`${type} Oxigraph graph ${graphName} cleared.`);

    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error(`Failed to fetch TTL file: ${response.statusText}`);
    const ttlData = await response.text();

    const parser = new Parser({ format: 'Turtle' });

    await new Promise((resolve, reject) => {
      parser.parse(ttlData, (error, quad) => {
        if (error) reject(error);
        if (quad) {
          // Force the quad into the specified named graph
          allQuads.push(DataFactory.quad(quad.subject, quad.predicate, quad.object, namedNode(graphName)));
        } else {
          resolve();
        }
      });
    });

    if (allQuads.length > 0) {
      const uniqueSubjects = new Set(allQuads.map(q => q.subject.value));
      const objectCount = uniqueSubjects.size;

      console.log(`Uploading to ${type} Oxigraph graph: ${graphName}`);
      // Use N-Quads to preserve the graph information
      await uploadToOxigraph(allQuads, OXIGRAPH_URL, graphName);
      
      return objectCount;
    }
    return 0;
  } catch (error) {
    console.error(`Error in ${type} Service:`, error);
    throw error;
  }
}

async function uploadToOxigraph(quads, url, graphName) {
  const writer = new Writer({ format: 'N-Quads' }); // Use N-Quads for named graphs
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