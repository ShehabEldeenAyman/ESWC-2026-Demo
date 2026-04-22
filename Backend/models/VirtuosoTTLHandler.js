import { Parser, Writer } from "n3";

export async function VirtuosoTTLHandler(VIRTUOSO_URL, fileUrl, type, graphName, deleteAndReplace = true) {
  if (!deleteAndReplace) {
    console.log(`${type} Virtuoso TTL: skipping fetch and upload (delete=false).`);
    return 0;
  }

  console.log(`Starting ${type} Virtuoso TTL Service: Fetching from ${fileUrl}...`);
  const allQuads = [];

  try {
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error(`Failed to fetch TTL file: ${response.statusText}`);
    const ttlData = await response.text();

    const parser = new Parser({ format: 'Turtle' });
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

    if (allQuads.length > 0) {
      const uniqueSubjects = new Set(allQuads.map(q => q.subject.value));
      const objectCount = uniqueSubjects.size;

      const gspUrl = `${VIRTUOSO_URL}?graph=${encodeURIComponent(graphName)}`;
      
      // Clear the graph first
      await fetch(gspUrl, { method: 'DELETE' });
      
      // Upload
      await uploadToVirtuoso(allQuads, VIRTUOSO_URL, graphName);
      return objectCount; 
    }
    return 0;
  } catch (error) {
    console.error(`Error in ${type} Virtuoso TTL Service:`, error);
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