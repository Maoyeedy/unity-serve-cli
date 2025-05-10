import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { readdir, stat } from 'node:fs/promises'

/**
 * Calculates the total size of a directory recursively
 * @param {string} dirPath - Path to the directory
 * @returns {Promise<number>} Total size in bytes
 */
async function calculateDirSize(dirPath) {
  let totalSize = 0;
  try {
    const items = await readdir(dirPath);
    for (const item of items) {
      const itemPath = join(dirPath, item);
      const stats = await stat(itemPath);
      if (stats.isDirectory()) {
        totalSize += await calculateDirSize(itemPath);
      } else {
        totalSize += stats.size;
      }
    }
  } catch {}
  return totalSize;
}

/**
 * Scans for available Unity WebGL builds
 * @param {string} buildsDir - Directory containing build folders
 * @returns {Promise<Array>} Array of found builds
 */
async function scanBuilds(buildsDir) {
  if (!existsSync(buildsDir)) return [];

  try {
    const items = await readdir(buildsDir);
    const builds = [];

    for (const item of items) {
      const itemPath = join(buildsDir, item);

      try {
        const stats = await stat(itemPath);
        if (stats.isDirectory() && existsSync(join(itemPath, 'ServiceWorker.js'))) {
          const size = await calculateDirSize(itemPath);
          builds.push({
            name: item,
            path: `/Builds/${item}/`,
            size
          });
        }
      } catch {}
    }

    return builds;
  } catch {
    return [];
  }
}

/**
 * Format bytes to MB with 2 decimal places
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size string
 */
function formatSizeToMB(bytes) {
  return (bytes / (1024 * 1024)).toFixed(2) + 'MB';
}

/**
 * Generate HTML content for builds list
 * @param {Array} builds - Array of build information
 * @returns {string} HTML content for builds list
 */
function generateBuildsList(builds) {
  if (builds.length === 0) {
    return '<p>No builds available.</p>';
  }

  const buildItems = builds
    .map(build => `<li><a href="${build.path}"><span class="build-name">${build.name}</span><span class="build-size">${formatSizeToMB(build.size)}</span></a></li>`)
    .join('');

  return `<ul>${buildItems}</ul>`;
}

/**
 * Generates HTML for the homepage displaying available Unity WebGL builds
 * @param {string} buildsDir - Directory containing build folders
 * @returns {Promise<string>} HTML content
 */
async function generateHomepage(buildsDir) {
  const builds = await scanBuilds(buildsDir);
  const content = generateBuildsList(builds);

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
  `;
}

export { generateHomepage };
