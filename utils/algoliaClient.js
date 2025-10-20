import algoliasearch from 'algoliasearch@5.27.0';

export const searchClient = algoliasearch(
  process.env.TU_APPLICATION_ID,
  process.env.TU_SEARCH_API_KEY
);

export const productosIndex = searchClient.initIndex(process.env.ALGOLIA_INDEX_NAME);