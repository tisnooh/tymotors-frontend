const http=require('http'),fs=require('fs'),path=require('path');
http.createServer((req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(/^\/images\/transformations\/front-(stock|tuned)-v1-(480|960|1672)\.webp$/.test(pathname)){
    const file=path.join(__dirname,'../public/images/transformations',path.basename(pathname));
    if(!fs.existsSync(file)){res.writeHead(404);res.end();return;}
    res.setHeader('Content-Type','image/webp');fs.createReadStream(file).pipe(res);return;
  }
  if(/^\/[a-zA-Z0-9_.-]+\.js$/.test(pathname)){
    const file=path.join(__dirname,'../.admin-test-build',path.basename(pathname));
    if(!fs.existsSync(file)){res.writeHead(404);res.end();return;}
    res.setHeader('Content-Type','text/javascript');fs.createReadStream(file).pipe(res);return;
  }
  res.setHeader('Content-Type','text/html');res.end('<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TYMotors — TEST LOCAL ISOLÉ</title><link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet"></head><body style="margin:0"><div id="root"></div><script src="/fixture.js"></script></body></html>');
}).listen(process.argv.includes('--visual')?3001:3000,'127.0.0.1',()=>console.log('Isolated test UI on loopback'));
