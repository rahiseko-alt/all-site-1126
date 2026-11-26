import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 4000;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

function createServerInstance() {
    return http.createServer((req, res) => {
        // Basic path resolution
        let filePath = req.url === '/' 
            ? path.join(__dirname, 'index.html')
            : path.join(__dirname, req.url.split('?')[0]);

        // Safety check to prevent directory traversal
        const relative = path.relative(__dirname, filePath);
        const isSafe = relative && !relative.startsWith('..') && !path.isAbsolute(relative);
        
        if (req.url !== '/' && !isSafe) {
            res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('403 Forbidden: Access denied.');
            return;
        }

        const extname = String(path.extname(filePath)).toLowerCase();
        const contentType = MIME_TYPES[extname] || 'application/octet-stream';

        fs.readFile(filePath, (error, content) => {
            if (error) {
                if (error.code === 'ENOENT') {
                    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
                    res.end('404 Not Found: File does not exist.');
                } else {
                    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                    res.end(`500 Internal Server Error: ${error.code}`);
                }
            } else {
                // Enable CORS headers for WebGL asset loading and browser comfort
                res.writeHead(200, { 
                    'Content-Type': contentType,
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
                    'Cache-Control': 'no-store, no-cache, must-revalidate, private'
                });
                res.end(content, 'utf-8');
            }
        });
    });
}

// Port hunting in case port 3000 is occupied
function startServer(port) {
    const server = createServerInstance();
    
    server.listen(port, () => {
        console.log('\n==================================================');
        console.log(`WebGL Shaders Ocean Standalone Server Running!`);
        console.log(`Local URL: http://localhost:${port}`);
        console.log('==================================================\n');
        console.log('Press Ctrl+C to terminate the server.\n');
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} is occupied. Trying port ${port + 1}...`);
            startServer(port + 1);
        } else {
            console.error('Server error:', err);
        }
    });
}

startServer(PORT);
