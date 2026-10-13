// CRA 5 callbacks -> WDS 5. Keep development-only routes behind WDS host/origin
// checks; registering them directly on server.app would bypass those checks.
const express = require('express');
const constrainDevPublicPath = require('./dev-public-path');

module.exports = function adaptDevServer(config, setupHealth) {
  const before = config.onBeforeSetupMiddleware;
  const after = config.onAfterSetupMiddleware;
  const setup = config.setupMiddlewares;
  delete config.onBeforeSetupMiddleware;
  delete config.onAfterSetupMiddleware;
  if ('https' in config) {
    const https = config.https;
    config.server = https ? { type: 'https', options: https === true ? {} : https } : 'http';
    delete config.https;
  }
  if (config.proxy === undefined) delete config.proxy;

  const extraHosts = (process.env.DEV_ALLOWED_HOSTS || '').split(',').map((host) => host.trim()).filter(Boolean);
  if (extraHosts.some((host) => !/^(?:[a-z\d](?:[a-z\d.-]*[a-z\d])?|\[::1\])$/i.test(host) || ['all', 'auto'].includes(host))) {
    throw new Error('DEV_ALLOWED_HOSTS must contain explicit hostnames, not wildcard/bypass values');
  }
  config.allowedHosts = ['localhost', '127.0.0.1', '[::1]', ...extraHosts];
  const extraOrigins = (process.env.DEV_ALLOWED_ORIGINS || '').split(',').map((origin) => origin.trim()).filter(Boolean);
  for (const origin of extraOrigins) {
    const parsed = new URL(origin);
    if (!['http:', 'https:'].includes(parsed.protocol) || parsed.origin !== origin) {
      throw new Error('DEV_ALLOWED_ORIGINS must contain explicit HTTP(S) origins');
    }
  }
  const isAllowedOrigin = (headers, protocol, allowMissing) => {
    const origin = headers.origin;
    if (!origin) return allowMissing && !(headers['sec-fetch-site'] === 'cross-site' && headers['sec-fetch-mode'] === 'no-cors');
    return origin === `${protocol}://${headers.host}` || extraOrigins.includes(origin);
  };
  if (config.headers && typeof config.headers === 'object' && !Array.isArray(config.headers)) {
    config.headers = { ...config.headers };
    for (const name of Object.keys(config.headers)) {
      if (/^access-control-allow-(origin|methods|headers)$/i.test(name) && config.headers[name] === '*') delete config.headers[name];
    }
  }
  constrainDevPublicPath(config);
  config.setupMiddlewares = (middlewares, server) => {
    // WebSocket upgrades bypass Express. WDS permits arbitrary IP Origins if
    // Host is allowed: narrow that same per-instance check, never its prototype.
    const originalSameOrigin = server.isSameOrigin.bind(server);
    server.isSameOrigin = (headers) => originalSameOrigin(headers) &&
      isAllowedOrigin(headers, server.options.server.type === 'https' ? 'https' : 'http', false);
    // CRA's source-map overlay still reads WDS4's _stats name. Use an alias,
    // never a stale copy: WDS5 replaces stats after every recompilation.
    if (!('_stats' in server)) Object.defineProperty(server, '_stats', {
      configurable: true, get() { return this.stats; },
    });
    const beforeRouter = express.Router();
    const afterRouter = express.Router();
    beforeRouter.use((req, res, next) => {
      // WDS permits configured hosts before its cross-site check. Do not let an
      // external page read local sources/edit endpoints even on loopback.
      if (!isAllowedOrigin(req.headers, req.socket.encrypted ? 'https' : 'http', true)) {
        res.status(403).end('Cross-Origin request blocked');
        return;
      }
      next();
    });
    const originalApp = server.app;
    try {
      server.app = beforeRouter;
      if (before) before(server);
      if (setup) middlewares = setup(middlewares, server);
      if (setupHealth) setupHealth(server);
      server.app = afterRouter;
      if (after) after(server);
    } finally {
      server.app = originalApp;
    }
    // WDS 5.2.6's two security checks precede its webpack middleware.
    const bundleIndex = middlewares.findIndex((item) => item.name === 'webpack-dev-middleware');
    middlewares.splice(bundleIndex < 0 ? middlewares.length : bundleIndex, 0,
      { name: 'tymotors-cra-before', middleware: beforeRouter });
    middlewares.push({ name: 'tymotors-cra-after', middleware: afterRouter });
    return middlewares;
  };
  return config;
};
