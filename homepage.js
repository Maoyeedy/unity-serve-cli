import { existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Calculates the total size of a directory recursively
 * @param {string} dirPath - Path to the directory
 * @returns {number} Total size in bytes
 */
const calculateDirSize = (dirPath) => {
  let totalSize = 0;

  try {
    const items = readdirSync(dirPath);

    for (const item of items) {
      const itemPath = join(dirPath, item);
      const stats = statSync(itemPath);

      if (stats.isDirectory()) {
        totalSize += calculateDirSize(itemPath);
      } else {
        totalSize += stats.size;
      }
    }

    return totalSize;
  } catch {
    return totalSize;
  }
};

/**
 * Scans for available Unity WebGL builds
 * @param {string} buildsDir - Directory containing build folders
 * @returns {Array} Array of found builds
 */
const scanBuilds = (buildsDir) => {
  if (!existsSync(buildsDir)) return []

  try {
    return readdirSync(buildsDir)
      .filter(item => {
        const itemPath = join(buildsDir, item)
        return statSync(itemPath).isDirectory() &&
               existsSync(join(itemPath, 'ServiceWorker.js'))
      })
      .map(folder => {
        const folderPath = join(buildsDir, folder);
        const size = calculateDirSize(folderPath);

        return {
          name: folder,
          path: `/Builds/${folder}/`,
          size: size
        };
      })
  } catch {
    return []
  }
}

/**
 * Format bytes to MB with 2 decimal places
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size string
 */
const formatSizeToMB = (bytes) => {
  return (bytes / (1024 * 1024)).toFixed(2) + 'MB';
};

/**
 * Generate HTML content for builds list
 * @param {Array} builds - Array of build information
 * @returns {string} HTML content for builds list
 */
const generateBuildsList = (builds) => {
  if (builds.length === 0) {
    return '<p>No builds available.</p>'
  }

  const buildItems = builds
    .map(build => `<li><a href="${build.path}"><span class="build-name">${build.name}</span><span class="build-size">${formatSizeToMB(build.size)}</span></a></li>`)
    .join('')

  return `<ul>${buildItems}</ul>`
}

/**
 * Generates HTML for the homepage displaying available Unity WebGL builds
 * @param {string} buildsDir - Directory containing build folders
 * @returns {string} HTML content
 */
const generateHomepage = (buildsDir) => {
  const builds = scanBuilds(buildsDir)
  const content = generateBuildsList(builds)

  return `
    <html>
        <head>
            <title>Unity WebGL Builds</title>
            <link rel="stylesheet" href="/style.css">
        </head>
        <body>
            <div class="container">
                <h1>Unity WebGL Builds</h1>
                ${content}
            </div>
        </body>
    </html>
  `
}

export { generateHomepage }
