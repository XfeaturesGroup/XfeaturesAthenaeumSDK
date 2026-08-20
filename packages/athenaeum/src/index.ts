/**
 * @xfeaturesgroup/athenaeum -- the primary developer package: types and the
 * REST client together, since the client is the only real consumer of the
 * types and a two-package split bought nothing but a second version number
 * to keep in sync.
 */
export * from "./types.js";
export { AthenaeumApiError, AthenaeumClient, type AthenaeumClientOptions } from "./client.js";
