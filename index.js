#!/usr/bin/env node
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import express from 'express'
import { generateHomepage } from './homepage.js'

// ES Module approach
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Express settings
const app = express()
const hostname = 'localhost'
const port = 8080
const enableCORS = false
const enableWasmMultithreading = true

// Directory Settings
const baseDir = __dirname
const buildsDir = join(baseDir, 'Builds')

app.use((req, res, next) => {
    var path = req.url

    if (enableWasmMultithreading &&
        (
            path == '/' ||
            path.includes('.js') ||
            path.includes('.html') ||
            path.includes('.htm')
        )
    ) {
        res.set('Cross-Origin-Opener-Policy', 'same-origin')
        res.set('Cross-Origin-Embedder-Policy', 'require-corp')
        res.set('Cross-Origin-Resource-Policy', 'cross-origin')
    }

    if (enableCORS) {
        res.set('Access-Control-Allow-Origin', '*')
    }

    if (path.endsWith('.br')) {
        res.set('Content-Encoding', 'br')
    } else if (path.endsWith('.gz')) {
        res.set('Content-Encoding', 'gzip')
    }

    if (path.includes('.wasm')) {
        res.set('Content-Type', 'application/wasm')
    } else if (path.includes('.js')) {
        res.set('Content-Type', 'application/javascript')
    } else if (path.includes('.json')) {
        res.set('Content-Type', 'application/json')
    } else if (
        path.includes('.data') ||
        path.includes('.bundle') ||
        path.endsWith('.unityweb')
    ) {
        res.set('Content-Type', 'application/octet-stream')
    }

    if (req.headers['cache-control'] == 'no-cache' &&
        (
            req.headers['if-modified-since'] ||
            req.headers['if-none-match']
        )
    ) {
        delete req.headers['cache-control']
    }

    next()
})

app.get('/', (req, res) => {
    res.send(generateHomepage(buildsDir))
})

app.use('/', express.static(baseDir, { immutable: true }))

const server = app.listen(port, hostname, () => {
    console.log(`Web server serving at http://${hostname}:${port}`)
    // console.log(`Web server serving directory ${baseDir} at http://${hostname}:${port}`);
})

server.addListener('error', (error) => {
    console.error(error)
})

server.addListener('close', () => {
    console.log('Server stopped.')
    process.exit()
})