#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const port = Number(process.argv[2] || process.env.PORT || 4173);

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function sendFile(res, filePath) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Internal Server Error');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': contentTypes[ext] || 'application/octet-stream',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(data);
  });
}

function resolveRequestPath(requestUrl) {
  const rawPath = decodeURIComponent((requestUrl || '/').split('?')[0]);
  const normalized = rawPath === '/' ? '/index.html' : rawPath;
  const safePath = path.normalize(normalized).replace(/^(\.\.(\/|\\|$))+/, '');
  return path.join(rootDir, safePath);
}

const server = http.createServer((req, res) => {
  const filePath = resolveRequestPath(req.url);

  fs.stat(filePath, (error, stat) => {
    if (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
      return;
    }

    if (stat.isDirectory()) {
      const indexPath = path.join(filePath, 'index.html');
      fs.stat(indexPath, (indexError, indexStat) => {
        if (indexError || !indexStat.isFile()) {
          res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('Directory listing is disabled');
          return;
        }
        sendFile(res, indexPath);
      });
      return;
    }

    sendFile(res, filePath);
  });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Panda Chat Overlay server running at http://127.0.0.1:${port}`);
  console.log('Press Ctrl+C to stop the server.');
});

server.on('error', error => {
  console.error(error.message);
  process.exit(1);
});
