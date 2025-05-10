# Unity Server

A server for playing Unity Web builds. Supports Gzip and Brotli.

## 1. Using as a CLI tool

You can quickly serve your Unity WebGL builds without cloning this repository:

```bash
# Navigate to your project directory containing a 'Builds' folder
cd your-project

# Run the server directly with npx
npx unity-webgl-server .

# Or globally install the package
npm install -g unity-webgl-server

# And then use it anywhere
unityserver .
```

The server will start at http://localhost:8080 and serve any Unity WebGL builds found in the `./Builds` directory.

## 2. Manual Setup

1. Clone or download this repository
2. Install Node.js if you haven't already.
3. Install dependencies:

```bash
npm install
```

## 3. Adding WebGL Builds

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

## 4. Starting the Server

Run the server with:

```bash
npm start
```

The server will then start at http://localhost:8080

## 5. Play the builds

1. Open the corresponding link with your browser. (preferably Chrome)
2. You will see a list of your WebGL builds.
3. Click on any build's name to run it

- If the build doesn't load, try forcing a hard refresh with Ctrl+Shift+R

## 6. Options

You can modify the following settings in `index.js`:

- `hostname`: The hostname to listen on ('localhost' by default)
- `port`: The port to use (8080 by default)
- `enableCORS`: Whether to enable Cross-Origin Resource Sharing
- `enableWasmMultithreading`: Whether to enable WebAssembly multithreading support

## References
- [Unity WebGL Documentation](https://docs.unity3d.com/Manual/webgl-building.html)
- [Unity Server Config Documentation](https://docs.unity3d.com/6000.0/Documentation/Manual/webgl-server-configuration-code-samples.html)
