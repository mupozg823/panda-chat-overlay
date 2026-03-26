#!/usr/bin/env node

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const rootDir = path.resolve(__dirname, '..');
const port = Number(process.argv[2] || process.env.PORT || 4173);
const upstreamOrigin = new URL(process.env.PANDATV_PROXY_ORIGIN || 'https://p.pandahp.kr');

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
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

function buildProxyUrl(requestUrl) {
  const localUrl = new URL(requestUrl || '/', `http://127.0.0.1:${port}`);
  return new URL(`${localUrl.pathname}${localUrl.search}`, upstreamOrigin);
}

function copyProxyHeaders(upstreamRes) {
  const headers = { 'Access-Control-Allow-Origin': '*' };

  for (const [key, value] of Object.entries(upstreamRes.headers)) {
    if (
      key === 'content-security-policy' ||
      key === 'content-security-policy-report-only' ||
      key === 'x-frame-options' ||
      key === 'content-encoding' ||
      key === 'transfer-encoding' ||
      key === 'connection'
    ) {
      continue;
    }

    headers[key] = value;
  }

  return headers;
}

function proxyRequest(req, res) {
  const targetUrl = buildProxyUrl(req.url);
  const client = targetUrl.protocol === 'https:' ? https : http;
  const upstreamHeaders = {
    ...req.headers,
    host: targetUrl.host,
    origin: upstreamOrigin.origin,
    referer: upstreamOrigin.origin + '/'
  };

  delete upstreamHeaders['accept-encoding'];
  delete upstreamHeaders.connection;

  const upstreamReq = client.request(
    targetUrl,
    {
      method: req.method,
      headers: upstreamHeaders
    },
    upstreamRes => {
      res.writeHead(upstreamRes.statusCode || 502, copyProxyHeaders(upstreamRes));

      if (req.method === 'HEAD') {
        upstreamRes.resume();
        res.end();
        return;
      }

      upstreamRes.pipe(res);
    },
  );

  upstreamReq.on('error', error => {
    res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`Upstream proxy error: ${error.message}`);
  });

  if (req.method === 'GET' || req.method === 'HEAD') {
    upstreamReq.end();
    return;
  }

  req.pipe(upstreamReq);
}

const server = http.createServer((req, res) => {
  const filePath = resolveRequestPath(req.url);

  fs.stat(filePath, (error, stat) => {
    if (error) {
      proxyRequest(req, res);
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
