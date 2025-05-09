import { existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

/**
 * @param {string} buildsDir
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
                <link rel="stylesheet" href="/style.css">
            </head>
            <body>
                <div class="container">
                    <h1>Unity WebGL Builds</h1>
                    ${buildLinks}
                </div>
            </body>
        </html>
    `
}

export { generateHomepage }
