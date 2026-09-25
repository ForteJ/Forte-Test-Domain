const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, 'www');
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.json': 'application/json' };

http.createServer((req, res) => {
  let filePath = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  if (filePath.endsWith(path.sep)) filePath = path.join(filePath, 'index.html');
  if (!path.extname(filePath)) filePath = path.join(root, 'index.html'); // SPA fallback for hash routes
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': mime[path.extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(8123, () => console.log('listening on 8123'));
