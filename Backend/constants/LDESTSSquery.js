import { name_GRAPH_LDESTSS } from './constants.js';


export const OXIGRAPH_BASE_URL_LDESTSS = "http://localhost:7878/"; // Base URL for Oxigraph
export const data_url_LDESTSS = "https://shehabeldeenayman.github.io/Mol_sluis_Dessel_Usecase/LDESTSS/LDESTSS.trig";

 export const RiverStage1YearTSSquery = (limit, offset) => `
 PREFIX tss: <https://w3id.org/tss#>
PREFIX sosa: <http://www.w3.org/ns/sosa/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?subject ?from ?pointType ?madeBySensor ?points
WHERE {
  GRAPH <${name_GRAPH_LDESTSS}> {
    ?subject a tss:Snippet ;
             tss:from ?from ;
             tss:pointType ?pointType ;
             tss:points ?points ;
             tss:about ?template .
    
    ?template sosa:madeBySensor ?madeBySensor ;
              sosa:observedProperty "River Stage" .
    
    
    FILTER (?from >= "2025-01-01T00:00:00"^^xsd:dateTime && 
            ?from < "2026-01-01T00:00:00"^^xsd:dateTime)
  }
}
ORDER BY ASC(?from)
    LIMIT ${limit}
  OFFSET ${offset}
  `;


export const RiverDischarge1YearTSSquery = (limit, offset) => `
PREFIX tss: <https://w3id.org/tss#>
PREFIX sosa: <http://www.w3.org/ns/sosa/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?subject ?from ?pointType ?madeBySensor ?points
WHERE {
  GRAPH <${name_GRAPH_LDESTSS}> {
    ?subject a tss:Snippet ;
             tss:from ?from ;
             tss:pointType ?pointType ;
             tss:points ?points ;
             tss:about ?template .
    
    ?template sosa:madeBySensor ?madeBySensor ;
              sosa:observedProperty "River Discharge" .
    
    FILTER (?from >= "2025-01-01T00:00:00"^^xsd:dateTime && 
            ?from < "2026-01-01T00:00:00"^^xsd:dateTime)
  }
}
ORDER BY ASC(?from)
LIMIT ${limit}
  OFFSET ${offset}
  `;

//---------------------------------------------------------------

 export const RiverStage1YearTSSqueryALL = () => `
 PREFIX tss: <https://w3id.org/tss#>
PREFIX sosa: <http://www.w3.org/ns/sosa/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?subject ?from ?pointType ?madeBySensor ?points
WHERE {
  GRAPH <${name_GRAPH_LDESTSS}> {
    ?subject a tss:Snippet ;
             tss:from ?from ;
             tss:pointType ?pointType ;
             tss:points ?points ;
             tss:about ?template .
    
    ?template sosa:madeBySensor ?madeBySensor ;
              sosa:observedProperty "River Stage" .
    
    
    FILTER (?from >= "2025-01-01T00:00:00"^^xsd:dateTime && 
            ?from < "2026-01-01T00:00:00"^^xsd:dateTime)
  }
}
ORDER BY ASC(?from)

  `;

export const RiverDischarge1YearTSSqueryALL = () => `
PREFIX tss: <https://w3id.org/tss#>
PREFIX sosa: <http://www.w3.org/ns/sosa/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?subject ?from ?pointType ?madeBySensor ?points
WHERE {
  GRAPH <${name_GRAPH_LDESTSS}> {
    ?subject a tss:Snippet ;
             tss:from ?from ;
             tss:pointType ?pointType ;
             tss:points ?points ;
             tss:about ?template .
    
    ?template sosa:madeBySensor ?madeBySensor ;
              sosa:observedProperty "River Discharge" .
    
    FILTER (?from >= "2025-01-01T00:00:00"^^xsd:dateTime && 
            ?from < "2026-01-01T00:00:00"^^xsd:dateTime)
  }
}
ORDER BY ASC(?from)

  `;