import { join } from 'node:path'
import { readdir, stat, access } from 'node:fs/promises'
import glob from 'fast-glob'

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
      try {
        const stats = await stat(itemPath);
        if (stats.isDirectory()) {
          totalSize += await calculateDirSize(itemPath);
        } else {
          totalSize += stats.size;
        }
      } catch (err) {
        // Skip inaccessible files
        continue;
      }
    }
  } catch (err) {
    // Handle errors when directory cannot be read
    return 0;
  }
  return totalSize;
}

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Scans for available Unity WebGL builds by finding TemplateData directories
 * @param {string} targetDir - Root directory to scan
 * @param {string[]} [ignorePatterns] - Patterns to ignore (node_modules, .git, Library by default)
 * @returns {Promise<Array>} Array of found builds
 */
async function scanBuilds(targetDir, ignorePatterns = ['**/node_modules/**', '**/.git/**', '**/Library/**', '**/Temp/**', '**/Obj/**']) {
  const builds = [];
  const processedDirs = new Set();

  try {
    if (!await fileExists(targetDir)) return [];

    // Find all TemplateData directories
    const templateDataPaths = await glob('**/TemplateData', {
      cwd: targetDir,
      ignore: ignorePatterns,
      onlyDirectories: true,
      absolute: false
    });

    // Process TemplateData directories
    for (const relativePath of templateDataPaths) {
      // TemplateData is inside the build directory, so we need the parent
      const buildDir = join(targetDir, relativePath.replace(/TemplateData$/, ''));

      if (processedDirs.has(buildDir)) continue;

      // Check if this is a valid build by verifying if it contains Build directory with wasm file
      const buildSubDir = join(buildDir, 'Build');
      if (!await fileExists(buildSubDir)) continue;

      // Check for wasm file in the Build directory
      const wasmFiles = await glob('**/*.wasm*', {
        cwd: buildSubDir,
        absolute: false
      });

      if (wasmFiles.length === 0) continue;

      processedDirs.add(buildDir);

      const pathParts = relativePath.split(/[/\\]/);
      let buildName;

      // Get parent directory of TemplateData
      if (pathParts.length >= 2) {
        buildName = pathParts[pathParts.length - 2];
      }

      if (!buildName) {
        buildName = 'Unknown Build';
      }

      const relPath = buildDir.substring(targetDir.length).replace(/\\/g, '/');
      const size = await calculateDirSize(buildDir);

      // Detect compression type
      const compressionType = await detectCompressionType(buildDir);

      builds.push({
        name: buildName,
        path: relPath.endsWith('/') ? relPath : `${relPath}/`,
        fullpath: buildDir,
        size,
        compressionType
      });
    }

    return builds;
  } catch (err) {
    console.error('Error scanning builds:', err);
    return [];
  }
}

/**
 * Detects compression type by checking for wasm files
 * @param {string} buildDir - Build directory path
 * @returns {Promise<string>} Compression type
 */
async function detectCompressionType(buildDir) {
  let compressionType = 'Unknown';
  try {
    const buildSubdir = join(buildDir, 'Build');
    if (await fileExists(buildSubdir)) {
      const buildFiles = await readdir(buildSubdir);
      for (const file of buildFiles) {
        if (file.endsWith('.wasm.br')) {
          compressionType = 'Brotli';
          break;
        } else if (file.endsWith('.wasm.gz')) {
          compressionType = 'Gzip';
          break;
        } else if (file.endsWith('.wasm')) {
          compressionType = 'Uncompressed';
          break;
        }
      }
    }
  } catch (err) {
    // Skip if we can't read the directory
  }
  return compressionType;
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
    .map(build => `<li><a href="${build.path}" title="${build.fullpath}"><span class="build-name">${build.name}</span><span class="build-size">${build.compressionType} ${formatSizeToMB(build.size)}</span></a></li>`)
    .join('');

  return `<ul>${buildItems}</ul>`;
}

/**
 * Generates HTML for the homepage displaying available Unity WebGL builds
 * @param {string} targetDir - Root directory to scan
 * @returns {Promise<string>} HTML content
 */
async function generateHomepage(targetDir) {
  const builds = await scanBuilds(targetDir);

  // Sort builds by name in ascending order
  builds.sort((a, b) => a.name.localeCompare(b.name));

  const content = generateBuildsList(builds);

  const styles = `
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      background-color: #f8f9fa;
      color: #333;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 30px 20px;
    }

    h1 {
      color: #2c3e50;
      margin-bottom: 30px;
      font-weight: 600;
      border-bottom: 2px solid #e9ecef;
      padding-bottom: 15px;
      font-size: 24px;
      font-style: italic;
    }

    ul {
      list-style-type: none;
      padding: 0;
      margin: 0;
    }

    li {
      margin: 0 0 20px 0;
      padding: 0;
      border-radius: 8px;
      box-shadow: 0 3px 9px rgba(0,0,0,0.08);
      transition: transform 0.2s, box-shadow 0.2s;
      background: white;
      overflow: hidden;
      width: 100%;
    }

    li:hover {
      transform: translateY(-3px);
      box-shadow: 0 3px 12px rgba(0,0,0,0.1);
    }

    a {
      color: #3498db;
      text-decoration: none;
      font-size: 18px;
      display: block;
      padding: 20px;
      text-align: left;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    a:hover {
      color: #2980b9;
    }

    .build-name {
      font-weight: 500;
    }

    .build-size {
      font-size: 12px;
      color: #7f8c8d;
      font-weight: normal;
    }

    p {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 3px 10px rgba(0,0,0,0.08);
    }
  `;

  return `
    <html>
        <head>
            <title>Unity WebGL Builds</title>
            <style>${styles}</style>
        </head>
        <body>
            <div class="container">
                <h1>${targetDir}</h1>
                ${content}
            </div>
        </body>
    </html>
  `;
}

export { generateHomepage };
