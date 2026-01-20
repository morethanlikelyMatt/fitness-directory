export { createSearchClient, createAdminClient } from "./client";
export { COLLECTION_NAME, fitnessCentersSchema } from "./schema";
export type { FitnessCenterDocument } from "./schema";
export {
  searchFitnessCenters,
  autocompleteFitnessCenters,
  type SearchParams,
  type SearchResponse,
  type SearchResultItem,
} from "./search";
export { indexFitnessCenter, removeFromIndex } from "./indexer";
