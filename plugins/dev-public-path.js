// WDM 5 treats publicPath as a prefix. A trailing slash prevents sibling-prefix
// traversal (GHSA-g84c-rxfj-3j2c); CRA otherwise removes that slash in dev mode.
// Keep the existing middleware/runtime API until its patched major preserves
// one-byte assets and byte-range responses. This is not an audit suppression.
module.exports = function constrainDevPublicPath(config) {
  const value = config.devMiddleware?.publicPath;
  if (typeof value === 'string' && value !== 'auto') {
    const suffixAt = value.search(/[?#]/);
    const prefix = suffixAt < 0 ? value : value.slice(0, suffixAt);
    const suffix = suffixAt < 0 ? '' : value.slice(suffixAt);
    config.devMiddleware = {
      ...config.devMiddleware,
      publicPath: `${!prefix ? '/' : prefix.endsWith('/') ? prefix : `${prefix}/`}${suffix}`,
    };
  }
  return config;
};
