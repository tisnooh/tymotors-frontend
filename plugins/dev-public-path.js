// Defense in depth: CRA removes this slash, even though the webpack middleware
// is now patched for traversal (GHSA-g84c-rxfj-3j2c). Preserve root/prefix meaning.
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
