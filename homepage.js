import { existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

/**
 * @param {string} buildsPath
 * @returns {string} - HTML content
 */

function generateHomepage (buildsDir) {
    let buildLinks = ''

    try {
        // Get subfolders
        const buildFolders = existsSync(buildsDir)
            ? readdirSync(buildsDir)
                .filter(item => statSync(join(buildsDir, item)).isDirectory())
            : []

        // Generate links
        if (buildFolders.length > 0) {
            buildLinks = '<ul>'
            buildFolders.forEach(folder => {
                buildLinks += `<li><a href="/Builds/${folder}/">${folder}</a></li>`
            })
            buildLinks += '</ul>'
        } else {
            buildLinks = '<p>No builds available. Copy your builds as "Builds" directory subfolders.</p>'
        }
    } catch (error) {
        console.error('Error generating homepage:', error)
        buildLinks = '<p>Error loading builds. Check server logs.</p>'
    }

    // Return the complete HTML
    return `
        <html>
            <head>
                <title>Unity WebGL Builds</title>
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
                <h1>Unity WebGL Builds</h1>
                ${buildLinks}
            </body>
        </html>
    `
}

export { generateHomepage }