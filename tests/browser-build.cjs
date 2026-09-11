const tooling=require('module').createRequire(require.resolve('react-scripts/package.json'));
const webpack=tooling('webpack');
process.env.BABEL_ENV='development';
const path=require('path');
const base=path.resolve(__dirname,'..');
webpack({
  mode:'development',devtool:false,entry:path.join(__dirname,'browser-entry.jsx'),
  output:{path:path.join(base,'.admin-test-build'),filename:'fixture.js'},
  resolve:{extensions:['.js','.jsx'],alias:{
    '@/contexts/AuthContext':path.join(__dirname,'browser-auth.jsx'),
    '@/lib/supabase':path.join(__dirname,'browser-supabase.js'),'@':path.join(base,'src')}},
  module:{rules:[
    {test:/\.jsx?$/,exclude:/node_modules/,use:{loader:tooling.resolve('babel-loader'),options:{presets:[tooling.resolve('babel-preset-react-app')]}}},
    {test:/\.css$/,use:[tooling.resolve('style-loader'),tooling.resolve('css-loader'),{loader:tooling.resolve('postcss-loader'),options:{postcssOptions:{plugins:[require('tailwindcss')(path.join(base,'tailwind.config.js')),require('autoprefixer')]}}}]},
  ]},
  plugins:[new webpack.DefinePlugin({'process.env.REACT_APP_BACKEND_URL':JSON.stringify('http://localhost:8765')})],
},(error,stats)=>{if(error||stats.hasErrors()){console.error(error||stats.toString({all:false,errors:true}));process.exitCode=1;}else console.log('Isolated browser test bundle ready');});
