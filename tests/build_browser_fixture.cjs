// Run with the path to an installed esbuild package. Never used for deployment.
const esbuild = require(process.argv[2] || 'esbuild');
esbuild.buildSync({ entryPoints: ['tests/browser_entry.jsx'], bundle: true, splitting: true, format: 'esm', minify: true, outdir: '.browser-test-build', loader: { '.js': 'jsx' },
  alias: { '@': './src', '@/contexts/AuthContext': './tests/browser_auth_fixture.jsx' },
  define: { 'process.env.NODE_ENV': '"production"', 'process.env.REACT_APP_BACKEND_URL': '"http://127.0.0.1:8765"', 'process.env.REACT_APP_SITE_MODE': '"test"', 'process.env.REACT_APP_SITE_URL': '"http://127.0.0.1:8765"', 'process.env': '{}' } });
