// Run with the path to an installed esbuild package. Never used for deployment.
const esbuild = require(process.argv[2] || 'esbuild');
const built = esbuild.buildSync({ metafile: true, entryPoints: ['tests/browser_entry.jsx'], bundle: true, splitting: true, format: 'esm', minify: true, outdir: '.browser-test-build', loader: { '.js': 'jsx' },
  alias: { '@': './src', '@/contexts/AuthContext': './tests/browser_auth_fixture.jsx' },
  define: { 'process.env.NODE_ENV': '"production"', 'process.env.REACT_APP_BACKEND_URL': '"http://127.0.0.1:8765"', 'process.env.REACT_APP_SITE_MODE': '"test"', 'process.env.REACT_APP_SITE_URL': '"http://127.0.0.1:8765"', 'process.env': '{}' } });
const fs = require('fs');
const css = Object.keys(built.metafile.outputs).filter(name => name.endsWith('.css')).map(name => require('path').basename(name)).filter(name => name !== 'browser_entry.css');
const html = fs.readFileSync('tests/browser_fixture.html', 'utf8').replace('</head>', css.map(name => `<link rel="stylesheet" href="/qa-assets/${name}">`).join('') + '</head>');
fs.writeFileSync('.browser-test-build/index.html', html);
fs.copyFileSync('tests/browser_fixture.svg', '.browser-test-build/fixture.svg');
