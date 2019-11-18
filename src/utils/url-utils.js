/**
 * Takes a URLSearchParams object and converts it to a regular JavaScript object with
 * key/value pairs based on the GET parameters supplied in a URL.
 *
 * @param {URLSearchParams} searchParams
 * @return {object}
 */
export const decodeParams = searchParams => Array
  .from(searchParams.keys())
  .reduce((acc, key) => ({ ...acc, [key]: searchParams.get(key) }), {});