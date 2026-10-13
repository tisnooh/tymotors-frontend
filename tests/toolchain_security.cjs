// Installed caller paths, not mocked dependencies. No network, payment or app data.
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createRequire } = require('node:module');
const { spawnSync } = require('node:child_process');
const { EventEmitter } = require('node:events');
const path = require('node:path');
const vm = require('node:vm');

const consumerRequire = (name) => createRequire(require.resolve(name));

function assertNoInjection(serialize, value) {
  const sandbox = {};
  try {
    const code = serialize(value);
    vm.runInNewContext(`(${code})`, sandbox, { timeout: 2000 });
  } catch (error) {
    // Rejecting a forged built-in is safe; executing a sentinel is not.
    assert.ok(['TypeError', 'SyntaxError', 'RangeError'].includes(error.name));
  }
  assert.equal(sandbox.injectionMarker, undefined);
}

for (const consumer of ['terser-webpack-plugin', 'css-minimizer-webpack-plugin', 'workbox-build']) {
  test(`${consumer}: patched serializer and RegExp/Date injection rejected`, () => {
    const load = consumerRequire(consumer);
    assert.equal(load('serialize-javascript/package.json').version, '7.1.2');
    const serialize = load('serialize-javascript');
    const forgedRegex = Object.create(RegExp.prototype);
    Object.defineProperty(forgedRegex, 'source', { get: () => 'x' });
    Object.defineProperty(forgedRegex, 'flags', {
      get: () => '"+(globalThis.injectionMarker=1)+"',
    });
    forgedRegex.toJSON = () => 'placeholder';
    assertNoInjection(serialize, { re: forgedRegex });
    const forgedDate = Object.create(Date.prototype);
    forgedDate.toISOString = () => '"+(globalThis.injectionMarker=1)+"';
    forgedDate.toJSON = () => 'placeholder';
    assertNoInjection(serialize, { date: forgedDate });
  });
}

test('serializer: forged arrays cannot enter an unbounded length loop', () => {
  const load = consumerRequire('terser-webpack-plugin');
  const result = spawnSync(process.execPath, ['-e', `
    const serialize = require(${JSON.stringify(load.resolve('serialize-javascript'))});
    const forged = Object.create(Array.prototype);
    forged.length = 4294967295;
    const restored = Function('return (' + serialize(forged) + ')')();
    if (Array.isArray(restored) || restored.length !== 4294967295) process.exit(1);
  `], { timeout: 6000, encoding: 'utf8' });
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stderr);
});

test('serializer: function bodies cannot close an embedded script element', () => {
  const serialize = consumerRequire('terser-webpack-plugin')('serialize-javascript');
  const fn = Function("return function f(x){ return x</script=+/ + '</script><img src=x onerror=alert(1)>' }")();
  assert.doesNotMatch(serialize({ fn }), /<\/script(?=[\t\n\f\r />])/i);
});

test('terser worker: functions, regular expressions and normal JS still minify', async () => {
  const load = consumerRequire('terser-webpack-plugin');
  const serializer = load('serialize-javascript');
  const TerserPlugin = require('terser-webpack-plugin');
  const { transform } = require('terser-webpack-plugin/dist/minify');
  const result = await transform(serializer({
    name: 'control.js', input: 'const answer = 40 + 2; console.log(answer);',
    inputSourceMap: undefined, extractComments: false,
    minimizer: { implementation: TerserPlugin.terserMinify, options: { mangle: false } },
  }));
  assert.equal(typeof result.code, 'string');
  assert.match(result.code, /console\.log/);
  const restored = vm.runInNewContext(`(${serializer({ fn: (value) => value + 1, re: /a+/gi })})`);
  assert.equal(restored.fn(41), 42);
  assert.equal(restored.re.flags, 'gi');
});

test('CSS worker: normal rules and media queries retain their meaning', async () => {
  const load = consumerRequire('css-minimizer-webpack-plugin');
  const CssPlugin = require('css-minimizer-webpack-plugin');
  const { transform } = require('css-minimizer-webpack-plugin/dist/minify');
  const result = await transform(load('serialize-javascript')({
    name: 'control.css', input: '.card { color: red; } @media (max-width: 430px) { .card { display: flex; } }',
    inputSourceMap: undefined,
    minimizer: { implementation: [CssPlugin.cssnanoMinify], options: [{}] },
  }));
  assert.deepEqual(result.errors, []);
  assert.match(result.outputs[0].code, /\.card\{color:red\}/);
  assert.match(result.outputs[0].code, /max-width:430px/);
});

test('selector parser: Tailwind and minifier callers use the patched version', () => {
  for (const consumer of ['tailwindcss', 'postcss-minify-selectors']) {
    assert.equal(consumerRequire(consumer)('postcss-selector-parser/package.json').version, '7.1.6');
  }
  const parser = require('postcss-selector-parser');
  const selector = '[role="button"]:not(.disabled) > .md\\:block:hover';
  assert.equal(parser().processSync(selector), selector);
  assert.throws(() => parser().processSync('[role="button"'));
});

test('selector parser: large flat class/id selectors complete in a bounded subprocess', () => {
  const result = spawnSync(process.execPath, ['-e', `
    const parser = require(${JSON.stringify(require.resolve('postcss-selector-parser'))});
    for (const prefix of ['.', '#']) {
      const input = (prefix+'a').repeat(200000);
      if (parser().processSync(input) !== input) process.exit(1);
    }
  `], { timeout: 30000, encoding: 'utf8' });
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stderr);
});

test('SockJS: patched uuid retains the no-argument CommonJS v4 API', () => {
  const load = consumerRequire('sockjs');
  assert.equal(load('uuid/package.json').version, '11.1.1');
  const uuid = load('uuid');
  const values = Array.from({ length: 100 }, () => uuid.v4());
  assert.equal(new Set(values).size, values.length);
  assert.ok(values.every((value) => uuid.validate(value) && uuid.version(value) === 4));
  assert.equal(uuid.validate('a'.repeat(100000)), false);
});

test('proxy agent: patched once resolves and rejects without leaking listeners', async () => {
  const load = consumerRequire('http-proxy-agent');
  assert.equal(load('@tootallnate/once/package.json').version, '2.0.1');
  const once = load('@tootallnate/once').default;
  const socket = new EventEmitter();
  const connected = once(socket, 'connect');
  socket.emit('connect');
  await connected;
  assert.equal(socket.listenerCount('connect'), 0);
  assert.equal(socket.listenerCount('error'), 0);
  const failed = once(socket, 'connect');
  const expected = new Error('fixture connection refused');
  socket.emit('error', expected);
  await assert.rejects(failed, expected);
  assert.equal(socket.listenerCount('connect'), 0);
  assert.equal(socket.listenerCount('error'), 0);
});

test('resolve-url-loader: patched PostCSS preserves relative URLs, query/hash and source maps', async () => {
  const load = consumerRequire('resolve-url-loader');
  assert.equal(load('./package.json').version, '5.0.0');
  assert.ok(require('semver').satisfies(load('postcss/package.json').version, '>=8.5.23 <9'));
  const { SourceMapGenerator } = load('source-map');
  const directory = __dirname;
  const outputDirectory = path.dirname(directory);
  const source = path.join(directory, 'fixture.scss');
  const input = '.card { background: url("./browser_fixture.svg?a=1#icon"); }';
  const map = new SourceMapGenerator({ file: 'fixture.css' });
  map.addMapping({ generated: { line: 1, column: 0 }, original: { line: 1, column: 0 }, source });
  map.setSourceContent(source, input);
  const output = await new Promise((resolve, reject) => {
    require('resolve-url-loader').call({
      context: outputDirectory, rootContext: outputDirectory,
      resourcePath: path.join(outputDirectory, 'fixture.css'),
      query: { sourceMap: true, root: outputDirectory }, sourceMap: true,
      getOptions: () => ({ sourceMap: true, root: outputDirectory }),
      fs: require('node:fs'),
      cacheable() {}, addDependency() {}, emitWarning: reject, emitError: reject,
      async: () => (error, code, sourceMap) => error ? reject(error) : resolve({ code, sourceMap }),
    }, input, map.toJSON());
  });
  assert.match(output.code, /\.\/tests\/browser_fixture\.svg\?a=1#icon/);
  assert.ok(output.sourceMap.sources.some((value) => /(^|\/)tests\/fixture\.scss$/.test(value.replace(/\\/g, '/'))));
  assert.ok(output.sourceMap.sourcesContent.includes(input));
});

// Isolated process: real Webpack/WDS lifecycle with an in-memory output filesystem.
// No source files, private data, disk writes or externally reachable socket.
async function devServerControl() {
  const assert = require('node:assert/strict');
  const path = require('node:path');
  const { randomUUID } = require('node:crypto');
  const webpack = require('webpack');
  const Server = require('webpack-dev-server');
  const constrain = require('./plugins/dev-server-compat');
  const outputPath = path.join(require('node:os').tmpdir(), `tymotors-toolchain-${randomUUID()}`);
  const compiler = webpack({
    mode: 'development', devtool: false, cache: false,
    entry: path.resolve('src/lib/consent.js'),
    output: { path: outputPath, filename: 'control.js', publicPath: '/assets' },
    infrastructureLogging: { level: 'none' }, stats: 'errors-only',
  });
  let before = false;
  let after = false;
  const server = new Server(constrain({
    host: '127.0.0.1', port: 0, allowedHosts: ['127.0.0.1'],
    static: false, client: false, hot: false, liveReload: false,
    webSocketServer: false, devMiddleware: { publicPath: '/assets', writeToDisk: false },
    onBeforeSetupMiddleware() { before = true; },
    onAfterSetupMiddleware() { after = true; },
  }), compiler);
  try {
    await server.start();
    const stats = await new Promise((resolve) => server.middleware.waitUntilValid(resolve));
    assert.equal(stats.hasErrors(), false);
    assert.ok(before && after); // CRA's existing deprecated hooks still work.
    assert.equal(server.middleware.getFilenameFromUrl('/assets/control.js'), path.join(outputPath, 'control.js'));
    const origin = `http://127.0.0.1:${server.server.address().port}`;
    const response = await fetch(`${origin}/assets/control.js`, { signal: AbortSignal.timeout(10000) });
    assert.equal(response.status, 200);
    assert.match(await response.text(), /ty_cookie_preferences/);
    const range = await fetch(`${origin}/assets/control.js`, {
      headers: { Range: 'bytes=0-0' }, signal: AbortSignal.timeout(10000),
    });
    assert.equal(range.status, 206);
    assert.equal(range.headers.get('content-length'), '1');
    assert.equal((await range.arrayBuffer()).byteLength, 1);
    const memoryFs = server.middleware.context.outputFileSystem;
    memoryFs.writeFileSync(path.join(outputPath, 'one.txt'), 'x');
    memoryFs.writeFileSync(path.join(outputPath, 'empty.txt'), '');
    for (const [file, expected] of [['one.txt', 'x'], ['empty.txt', '']]) {
      const asset = await fetch(`${origin}/assets/${file}`, { signal: AbortSignal.timeout(10000) });
      assert.equal(asset.status, 200);
      assert.equal(asset.headers.get('content-length'), String(expected.length));
      assert.equal(await asset.text(), expected);
      const head = await fetch(`${origin}/assets/${file}`, { method: 'HEAD', signal: AbortSignal.timeout(10000) });
      assert.equal(head.status, 200);
      assert.equal(head.headers.get('content-length'), String(expected.length));
      assert.equal((await head.arrayBuffer()).byteLength, 0);
    }
    memoryFs.writeFileSync(path.join(outputPath, 'many.txt'), 'abcdef');
    for (const [value, expected] of [['bytes=0-0', 'a'], ['bytes=1-1', 'b'], ['bytes=2-4', 'cde'], ['bytes=-2', 'ef']]) {
      const asset = await fetch(`${origin}/assets/many.txt`, { headers: { Range: value } });
      assert.equal(asset.status, 206);
      assert.equal(asset.headers.get('content-length'), String(expected.length));
      assert.equal(await asset.text(), expected);
    }
    const invalidRange = await fetch(`${origin}/assets/many.txt`, { headers: { Range: 'bytes=999-1000' } });
    assert.equal(invalidRange.status, 416);
    const malformedRange = await fetch(`${origin}/assets/many.txt`, { headers: { Range: 'bytes=not-a-range' } });
    assert.equal(malformedRange.status, 416); // Patched middleware rejects malformed ranges.
    const filename = `tymotors-sentinel-${randomUUID()}.txt`;
    const sentinel = `memory-only-${randomUUID()}`;
    server.middleware.context.outputFileSystem.writeFileSync(path.join(path.dirname(outputPath), filename), sentinel);
    for (const url of [`/assets../${filename}`, `/assets%2e%2e/${filename}`, `/assets..%2F${filename}`]) {
      const escaped = await fetch(`${origin}${url}`, { signal: AbortSignal.timeout(10000) });
      assert.ok([403, 404].includes(escaped.status));
      assert.ok(!(await escaped.text()).includes(sentinel));
    }
    const rebuilt = new Promise((resolve) => compiler.hooks.done.tap('TYMotorsToolchainRebuild', resolve));
    server.middleware.invalidate(() => {});
    const nextStats = await rebuilt;
    assert.notEqual(nextStats, stats);
    assert.equal(nextStats.hasErrors(), false);
    const afterRebuild = await fetch(`${origin}/assets/control.js`, { signal: AbortSignal.timeout(10000) });
    assert.equal(afterRebuild.status, 200);
    assert.match(await afterRebuild.text(), /ty_cookie_preferences/);
  } finally {
    await server.stop();
    await new Promise((resolve, reject) => compiler.close((error) => error ? reject(error) : resolve()));
  }
}

test('webpack middleware: WDS lifecycle works and output-root traversal is denied', () => {
  const result = spawnSync(process.execPath, ['-e', `(${devServerControl.toString()})().catch((error) => {
    console.error(error); process.exitCode = 1;
  });`], { cwd: path.join(__dirname, '..'), timeout: 45000, encoding: 'utf8', maxBuffer: 1024 * 1024 });
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stderr);
});

test('CRA/WDS5 adapter: HTTPS/proxy settings and hook order remain explicit', () => {
  const adapt = require('../plugins/dev-server-compat');
  const options = { cert: 'fixture-cert', key: 'fixture-key' };
  const config = adapt({ https: options, proxy: undefined, headers: { 'Access-Control-Allow-Origin': '*', 'X-Control': 'kept' } });
  assert.deepEqual(config.server, { type: 'https', options });
  assert.ok(!('https' in config) && !('proxy' in config));
  assert.equal(config.headers['X-Control'], 'kept');
  assert.equal(config.headers['Access-Control-Allow-Origin'], undefined);
  assert.notEqual(config.allowedHosts, 'all');
  assert.equal(adapt({ https: false }).server, 'http');
  assert.deepEqual(adapt({ https: true }).server, { type: 'https', options: {} });
});

// Actual CRA source-overlay + visual endpoints + optional health + WebSocket.
async function craDevServerControl() {
  const assert = require('node:assert/strict');
  const path = require('node:path');
  const webpack = require('webpack');
  const Server = require('webpack-dev-server');
  const WebSocket = require('ws');
  const craco = require('./craco.config');
  const compiler = webpack({ mode: 'development', devtool: 'source-map', cache: false,
    entry: path.resolve('src/lib/consent.js'),
    output: { path: path.join(require('node:os').tmpdir(), `tymotors-wds-${require('node:crypto').randomUUID()}`), filename: 'control.js', publicPath: '/assets/' },
    infrastructureLogging: { level: 'none' }, stats: 'errors-only' });
  const craConfig = require('react-scripts/config/webpackDevServer.config')(undefined, '127.0.0.1');
  const server = new Server(craco.devServer({ ...craConfig, static: false, host: '127.0.0.1', port: 0,
    devMiddleware: { publicPath: '/assets', writeToDisk: false },
    client: false, hot: true, liveReload: false, webSocketServer: { type: 'ws', options: { path: '/ws' } } }), compiler);
  let socket;
  try {
    await server.start();
    const stats = await new Promise((resolve) => server.middleware.waitUntilValid(resolve));
    assert.equal(stats.hasErrors(), false);
    const origin = `http://127.0.0.1:${server.server.address().port}`;
    // Node fetch may override the Host header; use raw HTTP to test the wire.
    const request = (route, headers = {}) => new Promise((resolve, reject) => {
      const req = require('node:http').get(origin + route, { headers }, (response) => {
        let body = ''; response.setEncoding('utf8'); response.on('data', (chunk) => { body += chunk; });
        response.on('end', () => resolve({ status: response.statusCode, body }));
      });
      req.setTimeout(10000, () => req.destroy(new Error('fixture HTTP timeout')));
      req.on('error', reject);
    });
    const module = [...stats.compilation.modules].find((item) => item.resource === path.resolve('src/lib/consent.js'));
    const moduleId = stats.compilation.chunkGraph.getModuleId(module);
    const overlayUrl = '/__get-internal-source?fileName=' + encodeURIComponent(`webpack-internal:///${moduleId}`);
    for (const route of ['/assets/control.js', overlayUrl, '/ping', '/health']) {
      const normal = await fetch(origin + route);
      assert.equal(normal.status, 200, route);
      assert.notEqual(normal.headers.get('access-control-allow-origin'), '*');
      await normal.text();
      assert.equal((await request(route, { Origin: origin })).status, 200);
      assert.equal((await request(route, { Origin: 'http://dev-approved.test:4321' })).status, 200);
      for (const headers of [{ Host: 'untrusted.invalid' }, { Origin: 'https://untrusted.invalid', 'Sec-Fetch-Site': 'cross-site' },
          { Origin: 'http://203.0.113.9' }, { 'Sec-Fetch-Site': 'cross-site', 'Sec-Fetch-Mode': 'no-cors' }]) {
        const rejected = await request(route, headers);
        assert.equal(rejected.status, 403, `${route}: ${JSON.stringify(headers)}`);
        assert.doesNotMatch(rejected.body, /ty_cookie_preferences|heapUsed|"status":"ok"/);
      }
    }
    socket = new WebSocket(origin.replace('http:', 'ws:') + '/ws', { origin });
    const messages = [];
    await new Promise((resolve, reject) => {
      socket.on('message', (data) => { const message = JSON.parse(String(data)); messages.push(message.type); if (message.type === 'ok') resolve(); });
      socket.once('error', reject);
    });
    assert.ok(messages.includes('hash') && messages.includes('hot'));
    socket.close();
    await new Promise((resolve) => socket.once('close', resolve));
    const approvedSocket = new WebSocket(origin.replace('http:', 'ws:') + '/ws', { origin: 'http://dev-approved.test:4321' });
    await new Promise((resolve, reject) => {
      approvedSocket.on('message', (data) => { if (JSON.parse(String(data)).type === 'ok') resolve(); });
      approvedSocket.once('error', reject);
    });
    approvedSocket.close();
    await new Promise((resolve) => approvedSocket.once('close', resolve));
    for (const extra of [{ origin: 'https://untrusted.invalid' }, { origin: 'http://203.0.113.9' },
        { origin: 'http://[2001:db8::1]' }, { origin: 'http://127.0.0.1:1' },
        { origin, headers: { Host: 'untrusted.invalid' } }]) {
      const denied = new WebSocket(origin.replace('http:', 'ws:') + '/ws', extra);
      const deniedMessages = [];
      await new Promise((resolve, reject) => {
        denied.on('message', (data) => deniedMessages.push(JSON.parse(String(data))));
        denied.once('close', resolve); denied.once('error', reject);
      });
      assert.deepEqual(deniedMessages, [{ type: 'error', data: 'Invalid Host/Origin header' }]);
    }
  } finally {
    if (socket && socket.readyState !== WebSocket.CLOSED) socket.terminate();
    await server.stop();
    await new Promise((resolve, reject) => compiler.close((error) => error ? reject(error) : resolve()));
  }
}

test('actual CRA/visual/health routes remain behind host and cross-origin checks, WebSocket works', () => {
  const result = spawnSync(process.execPath, ['-e', `(${craDevServerControl.toString()})().catch((error) => { console.error(error); process.exitCode=1; });`], {
    cwd: path.join(__dirname, '..'), env: { ...process.env, NODE_ENV: 'development', ENABLE_HEALTH_CHECK: 'true',
      DEV_ALLOWED_HOSTS: 'dev-approved.test', DEV_ALLOWED_ORIGINS: 'http://dev-approved.test:4321' },
    timeout: 60000, encoding: 'utf8', maxBuffer: 1024 * 1024,
  });
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stderr);
});

test('SVGR8: real CRA loader chain preserves SVG URL, ReactComponent, title/ref/viewBox', async () => {
  const webpack = require('webpack');
  const { Volume, createFsFromVolume } = require('memfs');
  assert.equal(consumerRequire('react-scripts/package.json')('@svgr/webpack/package.json').version, '8.1.0');
  const outputFs = createFsFromVolume(new Volume());
  outputFs.join = path.join.bind(path);
  const outputPath = path.join(require('node:os').tmpdir(), 'tymotors-svg-control');
  const compiler = webpack({ mode: 'development', target: 'node', devtool: false, cache: false,
    entry: path.resolve(__dirname, 'fixtures/svg-entry.js'), externals: { react: 'commonjs react' },
    output: { path: outputPath, filename: 'svg.js', library: { type: 'commonjs2' }, publicPath: '/' },
    module: { rules: [{ test: /\.svg$/, use: [
      { loader: require.resolve('@svgr/webpack'), options: { prettier: false, svgo: false,
        svgoConfig: { plugins: [{ removeViewBox: false }] }, titleProp: true, ref: true } },
      { loader: require.resolve('file-loader'), options: { name: 'static/media/[name].[hash].[ext]' } },
    ] }] }, infrastructureLogging: { level: 'none' }, stats: 'errors-only' });
  compiler.outputFileSystem = outputFs;
  try {
    const stats = await new Promise((resolve, reject) => compiler.run((error, stats) => error ? reject(error) : resolve(stats)));
    assert.equal(stats.hasErrors(), false, stats.toString());
    const result = { exports: {} };
    vm.runInNewContext(outputFs.readFileSync(path.join(outputPath, 'svg.js'), 'utf8'), { module: result, exports: result.exports, require });
    assert.match(result.exports.url, /^\/static\/media\/control\..+\.svg$/);
    assert.equal(result.exports.ReactComponent.$$typeof, Symbol.for('react.forward_ref'));
    const React = require('react');
    const html = require('react-dom/server').renderToStaticMarkup(React.createElement(result.exports.ReactComponent, { title: 'Control', ref: React.createRef() }));
    assert.match(html, /viewBox="0 0 24 24"/);
    assert.match(html, /<title[^>]*>Control<\/title>/);
  } finally { await new Promise((resolve, reject) => compiler.close((error) => error ? reject(error) : resolve())); }
});

test('NYC YAML4: actual caller loads inherited config; executable YAML tags rejected', async () => {
  const load = consumerRequire('@istanbuljs/load-nyc-config');
  assert.equal(load('js-yaml/package.json').version, '4.3.2');
  const settings = await require('@istanbuljs/load-nyc-config').loadNycConfig({ cwd: path.resolve(__dirname, 'fixtures'), nycrcPath: path.resolve(__dirname, 'fixtures/nyc.yml') });
  assert.deepEqual(settings.include, ['src/**/*.js']);
  assert.deepEqual(settings.exclude, ['src/**/*.test.js']);
  assert.equal(settings.all, true);
  assert.throws(() => load('js-yaml').load('payload: !!js/function "function(){return 1;}"'));
});

test('WDS5 HTTPS: async selfsigned certificate and legacy HTTPS options serve a trusted request', async () => {
  const webpack = require('webpack');
  const Server = require('webpack-dev-server');
  const cert = await require('selfsigned').generate([{ name: 'commonName', value: 'localhost' }], {
    algorithm: 'sha256', extensions: [{ name: 'subjectAltName', altNames: [{ type: 7, ip: '127.0.0.1' }] }],
  });
  const compiler = webpack({ mode: 'development', devtool: false, cache: false,
    entry: path.resolve('src/lib/consent.js'), output: { path: path.join(require('node:os').tmpdir(), 'tymotors-https-control'), filename: 'control.js' },
    infrastructureLogging: { level: 'none' }, stats: 'errors-only' });
  const server = new Server(require('../plugins/dev-server-compat')({ https: { key: cert.private, cert: cert.cert },
    host: '127.0.0.1', port: 0, static: false, client: false, hot: false, liveReload: false, webSocketServer: false }), compiler);
  try {
    await server.start();
    const stats = await new Promise((resolve) => server.middleware.waitUntilValid(resolve));
    assert.equal(stats.hasErrors(), false);
    const result = await new Promise((resolve, reject) => {
      const request = require('node:https').get(`https://127.0.0.1:${server.server.address().port}/control.js`, { ca: cert.cert }, (response) => {
        let body = ''; response.setEncoding('utf8'); response.on('data', (data) => { body += data; });
        response.on('end', () => resolve({ status: response.statusCode, body }));
      });
      request.setTimeout(10000, () => request.destroy(new Error('fixture HTTPS timeout')));
      request.on('error', reject);
    });
    assert.equal(result.status, 200);
    assert.match(result.body, /ty_cookie_preferences/);
  } finally { await server.stop(); await new Promise((resolve, reject) => compiler.close((error) => error ? reject(error) : resolve())); }
});

test('CRA publicPath guard: root, prefix, absolute URL and auto keep their meaning', () => {
  const constrain = require('../plugins/dev-public-path');
  for (const [input, expected] of [['', '/'], ['/', '/'], ['/assets', '/assets/'],
    ['/assets/', '/assets/'], ['http://localhost:3000/assets', 'http://localhost:3000/assets/'],
    ['/assets?q=1#bundle', '/assets/?q=1#bundle'], ['auto', 'auto']]) {
    const config = { devMiddleware: { publicPath: input, writeToDisk: false }, historyApiFallback: { index: '/assets/' } };
    const originalFallback = config.historyApiFallback;
    assert.equal(constrain(config), config);
    assert.equal(config.devMiddleware.publicPath, expected);
    assert.equal(config.devMiddleware.writeToDisk, false);
    assert.equal(config.historyApiFallback, originalFallback);
  }
  const config = {};
  assert.equal(constrain(config), config);
  assert.equal(config.devMiddleware, undefined);
  // Exercise the actual CRACO hook, including the existing visual-edit wrapper.
  const wired = require('../craco.config').devServer({ devMiddleware: { publicPath: '/assets' } });
  assert.equal(wired.devMiddleware.publicPath, '/assets/');
});
