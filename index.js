#!/usr/bin/env node
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { readFile } from 'node:fs/promises'

import Fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import { generateHomepage } from './homepage.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const fastify = Fastify()
const hostname = 'localhost'
const port = 8080
const enableCORS = true
const enableWasmMultithreading = true

// Support for command-line argument to specify the target directory
const targetDir = process.argv[2] ? join(process.cwd(), process.argv[2]) : process.cwd()

// Add response headers based on request
fastify.addHook('onSend', (request, reply, payload, done) => {
    const path = request.url

    if (enableWasmMultithreading &&
        (
            path == '/' ||
            path.includes('.js') ||
            path.includes('.html') ||
            path.includes('.htm')
        )
    ) {
        reply.header('Cross-Origin-Opener-Policy', 'same-origin')
        reply.header('Cross-Origin-Embedder-Policy', 'require-corp')
        reply.header('Cross-Origin-Resource-Policy', 'cross-origin')
    }

    if (enableCORS) {
        reply.header('Access-Control-Allow-Origin', '*')
    }

    if (path.endsWith('.br')) {
        reply.header('Content-Encoding', 'br')
    } else if (path.endsWith('.gz')) {
        reply.header('Content-Encoding', 'gzip')
    }

    if (path.includes('.wasm')) {
        reply.header('Content-Type', 'application/wasm')
    } else if (path.includes('.js')) {
        reply.header('Content-Type', 'application/javascript')
    } else if (path.includes('.json')) {
        reply.header('Content-Type', 'application/json')
    } else if (
        path.includes('.data') ||
        path.includes('.bundle') ||
        path.endsWith('.unityweb')
    ) {
        reply.header('Content-Type', 'application/octet-stream')
    }

    if (request.headers['cache-control'] == 'no-cache' &&
        (
            request.headers['if-modified-since'] ||
            request.headers['if-none-match']
        )
    ) {
        delete request.headers['cache-control']
    }

    done()
})

// Homepage route
fastify.get('/', async (request, reply) => {
    reply.header('Content-Type', 'text/html')
    reply.send(await generateHomepage(targetDir))
})

// Register static file serving
fastify.register(fastifyStatic, {
    root: targetDir,
    prefix: '/',
    immutable: true
})

const start = async () => {
    try {
        await fastify.listen({ port, host: hostname })
        console.log(`Web server serving at http://${hostname}:${port}`)
    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}

start()

// Handle process termination
process.on('SIGINT', async () => {
    await fastify.close()
    console.log('Server stopped.')
    process.exit(0)
})
