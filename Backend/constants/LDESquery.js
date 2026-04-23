// LDESquery.js
import { name_GRAPH_LDES } from './constants.js';

//export const OXIGRAPH_BASE_URL_LDES = "http://localhost:7879/";
export const data_url_LDES = "https://shehabeldeenayman.github.io/Mol_sluis_Dessel_Usecase/LDES/LDES.trig";

// Change this to an arrow function
export const RiverDischarge1YearLDESquery = (limit, offset) => `
      PREFIX sosa: <http://www.w3.org/ns/sosa/>
      PREFIX ex: <http://example.com/ns#>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

      SELECT ?subject ?value ?time ?runoffvalue
      WHERE {
        GRAPH <${name_GRAPH_LDES}> {
          ?subject sosa:observedProperty "River Discharge" ;
                   sosa:hasSimpleResult ?value ;
                   sosa:resultTime ?time ;
                   ex:runoffValue ?runoffvalue .
    FILTER (?time >= "2025-01-01T00:00:00"^^xsd:dateTime && 
            ?time < "2026-01-01T00:00:00"^^xsd:dateTime)
        }
      }
      ORDER BY DESC(?time)
      LIMIT ${limit}
      OFFSET ${offset}
    `;

// Change this to an arrow function
export const RiverStage1YearLDESquery = (limit, offset) => `
      PREFIX sosa: <http://www.w3.org/ns/sosa/>
      PREFIX ex: <http://example.com/ns#>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

      SELECT ?subject ?value ?time  
      WHERE {
        GRAPH <${name_GRAPH_LDES}> {
          ?subject sosa:observedProperty "River Stage" ;
                   sosa:hasSimpleResult ?value ;
                   sosa:resultTime ?time .
    FILTER (?time >= "2025-01-01T00:00:00"^^xsd:dateTime && 
            ?time < "2026-01-01T00:00:00"^^xsd:dateTime)
        }
      }
      ORDER BY DESC(?time)
      LIMIT ${limit}
      OFFSET ${offset}
    `;

//---------------------------------------------------------------

export const RiverDischarge1YearLDESqueryALL = () => `
      PREFIX sosa: <http://www.w3.org/ns/sosa/>
      PREFIX ex: <http://example.com/ns#>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

      SELECT ?subject ?value ?time ?runoffvalue
      WHERE {
        GRAPH <${name_GRAPH_LDES}> {
          ?subject sosa:observedProperty "River Discharge" ;
                   sosa:hasSimpleResult ?value ;
                   sosa:resultTime ?time ;
                   ex:runoffValue ?runoffvalue .
    FILTER (?time >= "2025-01-01T00:00:00"^^xsd:dateTime && 
            ?time < "2026-01-01T00:00:00"^^xsd:dateTime)
        }
      }
      ORDER BY DESC(?time)

    `;

    export const RiverStage1YearLDESqueryALL = () => `
      PREFIX sosa: <http://www.w3.org/ns/sosa/>
      PREFIX ex: <http://example.com/ns#>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

      SELECT ?subject ?value ?time  
      WHERE {
        GRAPH <${name_GRAPH_LDES}> {
          ?subject sosa:observedProperty "River Stage" ;
                   sosa:hasSimpleResult ?value ;
                   sosa:resultTime ?time .
    FILTER (?time >= "2025-01-01T00:00:00"^^xsd:dateTime && 
            ?time < "2026-01-01T00:00:00"^^xsd:dateTime)
        }
      }
      ORDER BY DESC(?time)

    `;
