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
  const constrain = require('./plugins/dev-public-path');
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
      assert.equal(await asset.text(), expected);
    }
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
