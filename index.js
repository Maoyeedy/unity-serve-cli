#!/usr/bin/env node
const path = require('path');
const express = require('express');
const { generateHomepage } = require('./homepage');

// Create express application
const app = express();

// Settings
const hostname = 'localhost';
const port = 8080;
const enableCORS = false;
const enableWasmMultithreading = true;

// Base directory where the server files are located
const baseDir = __dirname;
// Directory where all builds are stored
const buildsDir = path.join(baseDir, 'Builds');

// Middleware for handling headers and compression
app.use((req, res, next) => {
    var path = req.url;

    // Provide COOP, COEP and CORP headers for SharedArrayBuffer
    // multithreading: https://web.dev/coop-coep/
    if (enableWasmMultithreading &&
        (
            path == '/' ||
            path.includes('.js') ||
            path.includes('.html') ||
            path.includes('.htm')
        )
    ) {
        res.set('Cross-Origin-Opener-Policy', 'same-origin');
        res.set('Cross-Origin-Embedder-Policy', 'require-corp');
        res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    }

    // Set CORS headers
    if (enableCORS) {
        res.set('Access-Control-Allow-Origin', '*');
    }

    // Set content encoding depending on compression
    if (path.endsWith('.br')) {
        res.set('Content-Encoding', 'br');
    } else if (path.endsWith('.gz')) {
        res.set('Content-Encoding', 'gzip');
    }

    // Explicitly set content type. Files can have wrong content type if build uses compression.
    if (path.includes('.wasm')) {
        res.set('Content-Type', 'application/wasm');
    } else if (path.includes('.js')) {
        res.set('Content-Type', 'application/javascript');
    } else if (path.includes('.json')) {
        res.set('Content-Type', 'application/json');
    } else if (
        path.includes('.data') ||
        path.includes('.bundle') ||
        path.endsWith('.unityweb')
    ) {
        res.set('Content-Type', 'application/octet-stream');
    }

    // Ignore cache-control: no-cache 
    // when if-modified-since or if-none-match is set
    // because Unity Loader will cache and revalidate manually
    if (req.headers['cache-control'] == 'no-cache' &&
        (
            req.headers['if-modified-since'] ||
            req.headers['if-none-match']
        )
    ) {
        delete req.headers['cache-control'];
    }

    next();
});

// Serve the root directory with dynamically generated list of builds
app.get('/', (req, res) => {
    res.send(generateHomepage(buildsDir));
});

// Serve static files from the base directory
app.use('/', express.static(baseDir, { immutable: true }));

const server = app.listen(port, hostname, () => {
    // console.log(`Web server serving directory ${baseDir} at http://${hostname}:${port}`);
    console.log(`Web server serving at http://${hostname}:${port}`);
});

server.addListener('error', (error) => {
    console.error(error);
});

server.addListener('close', () => {
    console.log('Server stopped.');
    process.exit();
});
