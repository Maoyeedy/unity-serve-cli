# Unity Serve

<!-- ![Unity Serve](https://img.shields.io/npm/v/unity-serve) -->
[![Unity Serve](https://img.shields.io/npm/v/unity-serve)](https://www.npmjs.com/package/unity-serve)

A blazing fast server that host Unity WebGL builds with correct headers, supporting Gzip and Brotli.

## Installation

```bash
# Globally install the package
npm install -g unity-serve
unity-serve $Path

# Or one time use
npx unity-serve $Path
```

The server will start at http://localhost:8080 and list all WebGL directory recursively under `$Path`.

## Play the builds

1. Open the corresponding link with your browser. (preferably Chrome)
2. If used correct, you'll see a list of your WebGL builds.
3. Click on any build's name to launch it.

> If the game doesn't load, try Ctrl+Shift+R to force reload.

## Development Options

Settings in `index.js`:

- `hostname`: 'localhost' by default. For public hosting, change it to '0.0.0.0'
- `port`: 8080 by default, will increment if port occupied
- `enableCORS`: Whether to enable Cross-Origin Resource Sharing
- `enableWasmMultithreading`: Whether to enable WebAssembly multithreading support

## References
- [Unity WebGL Documentation](https://docs.unity3d.com/Manual/webgl-building.html)
- [Unity Server Config Documentation](https://docs.unity3d.com/6000.0/Documentation/Manual/webgl-server-configuration-code-samples.html)
