const http=require('http'),fs=require('fs'),path=require('path');
http.createServer((req,res)=>{
  if(req.url==='/fixture.js'){res.setHeader('Content-Type','text/javascript');fs.createReadStream(path.join(__dirname,'../.admin-test-build/fixture.js')).pipe(res);return;}
  res.setHeader('Content-Type','text/html');res.end('<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TYMotors — TEST LOCAL ISOLÉ</title></head><body style="margin:0"><div id="root"></div><script src="/fixture.js"></script></body></html>');
}).listen(3000,'127.0.0.1',()=>console.log('Isolated admin test UI on http://localhost:3000/admin'));
