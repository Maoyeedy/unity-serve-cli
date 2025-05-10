# Unity Web Server

A simple node server for hosting Unity Web builds. Supports Gzip and Brotli.

## 1. Setup

1. Clone or download this repository
2. Install Node.js if you haven't already.
3. Install dependencies:

```bash
npm install
```

## 2. Adding WebGL Builds

Copy your WebGL build folders as subfolders of 'Builds'. Example folder structure:

```
project-root/
├── Builds/
│   ├── DungeonShuffle/
│   ├── RubyRanAwayFromHome/
│   ├── WebGLBuild_3_Final_NoEdit_LastEdition_ForReal_5/
│   └── ...
└── ...
```

## 3. Starting the Server

Run the server with:

```bash
npm start
```

The server will then start at http://localhost:8080

## 4. Play the builds

1. Open the corresponding link with your browser. (preferably Chrome)
2. You will see a list of your WebGL builds.
3. Click on any build's name to run it

- If the build doesn't load, try forcing a hard refresh with Ctrl+Shift+R

## Options

You can modify the following settings in `index.js`:

- `hostname`: The hostname to listen on ('localhost' by default)
- `port`: The port to use (8080 by default)
- `enableCORS`: Whether to enable Cross-Origin Resource Sharing
- `enableWasmMultithreading`: Whether to enable WebAssembly multithreading support

## References
- [Unity WebGL Documentation](https://docs.unity3d.com/Manual/webgl-building.html)
- [Unity Server Config Documentation](https://docs.unity3d.com/6000.0/Documentation/Manual/webgl-server-configuration-code-samples.html)
