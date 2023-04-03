const repoCandidates = ['2022_ino_DigitalTwinOntology_v2', 'v2022_12_21', 'v2022_12_15'];
// const graphdbEndpointUrl = `https://sdm.hongo.wide.ad.jp/graphdb/repositories/2022_ino_DigitalTwinOntology_v2`;

export const sparqlAxios = async (
  axios: any,
  endpoint: (axios: any) => Promise<any>,
  query: string,
  successCallback: (e: any) => void,
  errorCallback: (e: Error) => void
) => {
  axios
    .get(concatUri(import.meta.env.VITE_GRAPHDB_ENDPOINT_URL, query), {
      headers: { Accept: 'application/sparql-results+json' },
    })
    .catch((err: Error) => errorCallback(err))
    .then((resp: any) => successCallback(resp));
};


export const sparqlEndpointUrl = async (axios: any) => {
  const res = await axios.get('/graphdb/repositories');
  return res.data.results.bindings.find((a: { id: { value: string } }) => {
    return repoCandidates.includes(a.id.value);
  }).uri.value;
};

const concatUri = (endpoint: string, query: string): string => {
  return (
    endpoint +
    '?name=&infer=true&sameAs=true&query=' +
    encodeURIComponent(query)
  );
};

export const sampleQuery = `\
PREFIX dotorsrc: <https://ino-masterthesis.github.io/DOTO/resources/>
PREFIX doto:      <https://ino-masterthesis.github.io/DOTO/doto.owl#>

select * where {
	dotorsrc:frutera doto:has_property ?o .
} limit 100
`;
