import { name_GRAPH_TTL } from './constants.js';

export const RiverDischarge1YearTTLqueryVirtuoso = (limit, offset) =>`
  PREFIX sosa: <http://www.w3.org/ns/sosa/>
  PREFIX ex: <http://example.com/ns#>
  PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

  SELECT ?subject ?value ?time ?runoffvalue
  WHERE {
  GRAPH <${name_GRAPH_TTL}> { 
      ?subject a sosa:Observation ;
               sosa:observedProperty "River Discharge" ;
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

export const RiverStage1YearTTLqueryVirtuoso = (limit, offset) =>`
  PREFIX sosa: <http://www.w3.org/ns/sosa/>
  PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

  SELECT ?subject ?value ?time  
  WHERE {
      GRAPH <${name_GRAPH_TTL}> { 

      ?subject a sosa:Observation ;
               sosa:observedProperty "River Stage" ;
               sosa:hasSimpleResult ?value ;
               sosa:resultTime ?time .
               
    FILTER (?time >= "2025-01-01T00:00:00"^^xsd:dateTime && 
            ?time < "2026-01-01T00:00:00"^^xsd:dateTime)
  }}
  ORDER BY DESC(?time)
  LIMIT ${limit}
  OFFSET ${offset}
`;

export const RiverDischarge1YearTTLqueryOxigraph = (limit, offset) =>`
  PREFIX sosa: <http://www.w3.org/ns/sosa/>
  PREFIX ex: <http://example.com/ns#>
  PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

  SELECT ?subject ?value ?time ?runoffvalue
  WHERE {
    GRAPH <${name_GRAPH_TTL}> {
      ?subject a sosa:Observation ;
               sosa:observedProperty "River Discharge" ;
               sosa:hasSimpleResult ?value ;
               sosa:resultTime ?time .
      
      OPTIONAL { ?subject ex:runoffValue ?runoffvalue . }
      
    FILTER (?time >= "2025-01-01T00:00:00"^^xsd:dateTime && 
            ?time < "2026-01-01T00:00:00"^^xsd:dateTime)
    }
  }
  ORDER BY DESC(?time)
  LIMIT ${limit}
  OFFSET ${offset}
`;

export const RiverStage1YearTTLqueryOxigraph = (limit, offset) =>`
  PREFIX sosa: <http://www.w3.org/ns/sosa/>
  PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

  SELECT ?subject ?value ?time  
  WHERE {
    GRAPH <${name_GRAPH_TTL}> {
      ?subject a sosa:Observation ;
               sosa:observedProperty "River Stage" ;
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

export const RiverDischarge1YearTTLqueryVirtuosoALL = () =>`
  PREFIX sosa: <http://www.w3.org/ns/sosa/>
  PREFIX ex: <http://example.com/ns#>
  PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

  SELECT ?subject ?value ?time ?runoffvalue
  WHERE {
  GRAPH <${name_GRAPH_TTL}> {
      ?subject a sosa:Observation ;
               sosa:observedProperty "River Discharge" ;
               sosa:hasSimpleResult ?value ;
               sosa:resultTime ?time .
      
      OPTIONAL { ?subject ex:runoffValue ?runoffvalue . }

    FILTER (?time >= "2025-01-01T00:00:00"^^xsd:dateTime && 
            ?time < "2026-01-01T00:00:00"^^xsd:dateTime)
  }}
  ORDER BY DESC(?time)

`;

export const RiverStage1YearTTLqueryVirtuosoALL = () =>`
  PREFIX sosa: <http://www.w3.org/ns/sosa/>
  PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

  SELECT ?subject ?value ?time  
  WHERE {
  GRAPH <${name_GRAPH_TTL}> {
      ?subject a sosa:Observation ;
               sosa:observedProperty "River Stage" ;
               sosa:hasSimpleResult ?value ;
               sosa:resultTime ?time .
               
    FILTER (?time >= "2025-01-01T00:00:00"^^xsd:dateTime && 
            ?time < "2026-01-01T00:00:00"^^xsd:dateTime)
  }}
  ORDER BY DESC(?time)

`;

export const RiverDischarge1YearTTLqueryOxigraphALL = () =>`
  PREFIX sosa: <http://www.w3.org/ns/sosa/>
  PREFIX ex: <http://example.com/ns#>
  PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

  SELECT ?subject ?value ?time ?runoffvalue
  WHERE {
    GRAPH <${name_GRAPH_TTL}> {
      ?subject a sosa:Observation ;
               sosa:observedProperty "River Discharge" ;
               sosa:hasSimpleResult ?value ;
               sosa:resultTime ?time .
      
      OPTIONAL { ?subject ex:runoffValue ?runoffvalue . }
      
    FILTER (?time >= "2025-01-01T00:00:00"^^xsd:dateTime && 
            ?time < "2026-01-01T00:00:00"^^xsd:dateTime)
    }
  }
  ORDER BY DESC(?time)

`;

export const RiverStage1YearTTLqueryOxigraphALL = () =>`
  PREFIX sosa: <http://www.w3.org/ns/sosa/>
  PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

  SELECT ?subject ?value ?time  
  WHERE {
    GRAPH <${name_GRAPH_TTL}> {
      ?subject a sosa:Observation ;
               sosa:observedProperty "River Stage" ;
               sosa:hasSimpleResult ?value ;
               sosa:resultTime ?time .
               
    FILTER (?time >= "2025-01-01T00:00:00"^^xsd:dateTime && 
            ?time < "2026-01-01T00:00:00"^^xsd:dateTime)
    }
  }
  ORDER BY DESC(?time)

`;