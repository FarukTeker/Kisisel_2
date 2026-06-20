/**
 * Injection tokens for the ordered stage arrays. The module binds each to a
 * `useFactory` that returns the stages in execution order, so reordering or
 * adding a stage is a one-line change there.
 */
export const INGESTION_STAGES = Symbol('INGESTION_STAGES');
export const ENRICHMENT_STAGES = Symbol('ENRICHMENT_STAGES');
