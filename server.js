const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // 1. Check API endpoint for saving data back to disk in real-time
  if (req.method === 'POST' && req.url === '/api/save-storefront-data') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const parsedData = JSON.parse(body);
        
        // Basic schema verification to ensure safety
        if (!parsedData.settings || !parsedData.texts || !parsedData.products) {
          throw new Error("Invalid storefront state schema");
        }
        
        // Convert back into elegant javascript products file format
        const productsJsContent = `// Default products catalogue and static texts for Solstice Studio
// Attached to the window object to support the file:// protocol seamlessly without CORS issues

window.DEFAULT_STORE_DATA = ${JSON.stringify(parsedData, null, 2)};
`;
        
        // Write file back to products.js on hard drive!
        const productsJsPath = path.join(PUBLIC_DIR, 'products.js');
        fs.writeFileSync(productsJsPath, productsJsContent, 'utf8');
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: "Products file successfully saved to workspace." }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }
  
  // 2. Serve static files
  let filePath = path.join(PUBLIC_DIR, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
  
  // Security check: ensure path is within PUBLIC_DIR
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Access Denied');
    return;
  }
  
  const ext = path.extname(filePath);
  let contentType = MIME_TYPES[ext] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 File Not Found</h1>');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n=============================================================`);
  console.log(`  SOLSTICE STUDIO LOCAL LIVE CMS RUNNING AT:`);
  console.log(`  👉 http://localhost:${PORT}`);
  console.log(`=============================================================\n`);
});
