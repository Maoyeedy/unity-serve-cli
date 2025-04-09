#!/usr/bin/env -S deno run --allow-net --allow-read --allow-env

import { join, fromFileUrl } from "https://deno.land/std/path/mod.ts"
import { serve } from "https://deno.land/std/http/server.ts"
import { generateHomepage } from "./homepage-deno.js"

// Correctly resolve the base directory
// For local file execution, use fromFileUrl with import.meta.url
const baseDir = fromFileUrl(new URL(".", import.meta.url).href)
const buildsDir = join(baseDir, "Builds")

// Log the actual paths for debugging
console.log(`Base directory: ${baseDir}`)
console.log(`Builds directory: ${buildsDir}`)

// Express settings
const hostname = "localhost"
const port = 8080
const enableCORS = false
const enableWasmMultithreading = true

async function handler (req) {
    const url = new URL(req.url)
    const path = url.pathname

    // Set appropriate headers
    const headers = new Headers()

    if (enableWasmMultithreading &&
        (path === "/" ||
            path.includes(".js") ||
            path.includes(".html") ||
            path.includes(".htm"))
    ) {
        headers.set("Cross-Origin-Opener-Policy", "same-origin")
        headers.set("Cross-Origin-Embedder-Policy", "require-corp")
        headers.set("Cross-Origin-Resource-Policy", "cross-origin")
    }

    if (enableCORS) {
        headers.set("Access-Control-Allow-Origin", "*")
    }

    if (path.endsWith(".br")) {
        headers.set("Content-Encoding", "br")
    } else if (path.endsWith(".gz")) {
        headers.set("Content-Encoding", "gzip")
    }

    if (path.includes(".wasm")) {
        headers.set("Content-Type", "application/wasm")
    } else if (path.includes(".js")) {
        headers.set("Content-Type", "application/javascript")
    } else if (path.includes(".json")) {
        headers.set("Content-Type", "application/json")
    } else if (
        path.includes(".data") ||
        path.includes(".bundle") ||
        path.endsWith(".unityweb")
    ) {
        headers.set("Content-Type", "application/octet-stream")
    }

    // Handle root request
    if (path === "/") {
        const homepageContent = await generateHomepage(buildsDir)
        return new Response(homepageContent, {
            status: 200,
            headers: new Headers({
                ...Object.fromEntries(headers),
                "Content-Type": "text/html",
            }),
        })
    }

    // Serve static files
    try {
        const fullPath = join(baseDir, path.slice(1)) // Remove leading slash

        try {
            const fileInfo = await Deno.stat(fullPath)

            if (fileInfo.isFile) {
                const fileContent = await Deno.readFile(fullPath)
                return new Response(fileContent, {
                    status: 200,
                    headers,
                })
            } else if (fileInfo.isDirectory) {
                // If it's a directory and doesn't end with a slash, redirect to add the slash
                if (!path.endsWith("/")) {
                    return new Response(null, {
                        status: 301,
                        headers: new Headers({
                            ...Object.fromEntries(headers),
                            "Location": `${path}/`,
                        }),
                    })
                }

                // Try to serve index.html from the directory
                const indexPath = join(fullPath, "index.html")
                try {
                    const indexContent = await Deno.readFile(indexPath)
                    return new Response(indexContent, {
                        status: 200,
                        headers: new Headers({
                            ...Object.fromEntries(headers),
                            "Content-Type": "text/html",
                        }),
                    })
                } catch {
                    // No index.html, generate directory listing
                    const dirContent = await generateDirectoryListing(fullPath, path)
                    return new Response(dirContent, {
                        status: 200,
                        headers: new Headers({
                            ...Object.fromEntries(headers),
                            "Content-Type": "text/html",
                        }),
                    })
                }
            }
        } catch (error) {
            console.error(`Error accessing path ${fullPath}:`, error)
        }
    } catch (error) {
        console.error(`General error:`, error)
    }

    // File not found or permission error
    return new Response("Not Found", {
        status: 404,
        headers: new Headers({
            ...Object.fromEntries(headers),
            "Content-Type": "text/plain",
        }),
    })
}

async function generateDirectoryListing (dirPath, urlPath) {
    const entries = []

    try {
        for await (const entry of Deno.readDir(dirPath)) {
            entries.push(entry)
        }
    } catch (error) {
        console.error(`Error reading directory ${dirPath}:`, error)
        return `<html><body><h1>Error reading directory</h1><p>${error.message}</p></body></html>`
    }

    let html = `
    <html>
      <head>
        <title>Directory Listing: ${urlPath}</title>
        <style>
          body { font-family: sans-serif; margin: 20px; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #333; }
          ul { list-style-type: none; padding: 0; }
          li { margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 5px; }
          a { color: #0066cc; text-decoration: none; font-size: 18px; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <h1>Directory Listing: ${urlPath}</h1>
        <ul>
  `

    if (urlPath !== "/") {
        html += `<li><a href="${urlPath.endsWith('/') ? urlPath + '..' : path + '/../'}/">Parent Directory</a></li>`
    }

    for (const entry of entries) {
        const name = entry.name
        const isDir = entry.isDirectory
        html += `<li><a href="${urlPath}${name}${isDir ? "/" : ""}">${name}${isDir ? "/" : ""}</a></li>`
    }

    html += `
        </ul>
      </body>
    </html>
  `

    return html
}

console.log(`Web server serving at http://${hostname}:${port}`)
await serve(handler, { hostname, port })