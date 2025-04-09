/**
 * @param {string} buildsDir - Path to builds directory
 * @returns {Promise<string>} - HTML content
 */
async function generateHomepage (buildsDir) {
    let buildLinks = ''

    try {
        console.log(`Checking builds directory: ${buildsDir}`)

        // Check if builds directory exists
        try {
            const buildDirInfo = await Deno.stat(buildsDir)

            if (!buildDirInfo.isDirectory) {
                console.log("Builds path exists but is not a directory")
                buildLinks = '<p>Builds path exists but is not a directory. Please create a "Builds" directory.</p>'
            } else {
                console.log("Builds directory exists, scanning for subfolders...")

                // Get subfolders
                const entries = []
                for await (const entry of Deno.readDir(buildsDir)) {
                    if (entry.isDirectory) {
                        console.log(`Found build directory: ${entry.name}`)
                        entries.push(entry.name)
                    }
                }

                // Generate links
                if (entries.length > 0) {
                    buildLinks = '<ul>'
                    for (const folder of entries) {
                        buildLinks += `<li><a href="/Builds/${folder}/">${folder}</a></li>`
                    }
                    buildLinks += '</ul>'
                } else {
                    console.log("No build folders found")
                    buildLinks = '<p>No builds available. Copy your builds as "Builds" directory subfolders.</p>'
                }
            }
        } catch (error) {
            // Directory doesn't exist or can't be read
            console.error(`Error accessing Builds directory: ${error.message}`)
            buildLinks = `<p>Builds directory not found at "${buildsDir}". Create a "Builds" directory in the root folder.</p>`
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