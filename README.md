# Unity WebGL Server

A simple Node.js server for hosting your Unity WebGL builds locally.

## Setup

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   # or if using pnpm
   pnpm install
   ```

## Adding Your Unity WebGL Builds

1. Create a folder named `Builds` in the project root directory
2. Copy your Unity WebGL build folders directly into the `Builds` directory
   ```
   project-root/
   ├── Builds/
   │   ├── Game1/
   │   ├── MyGameTwo/
   │   └── ...
   └── ...
   ```

## Starting the Server

Run the server with:

```bash
npm start
# or if using pnpm
pnpm start
```

The server will start at http://localhost:8080

## Accessing Your Builds

1. Open your browser and navigate to http://localhost:8080
2. You'll see a list of all your WebGL builds
3. Click on any build name to run it

- If your build doesn't load, try forcing a hard refresh with Ctrl+Shift+R

## Options

You can modify the following settings in `index.js`:

- `hostname`: The hostname to listen on ('localhost' by default)
- `port`: The port to use (8080 by default)
- `enableCORS`: Whether to enable Cross-Origin Resource Sharing
- `enableWasmMultithreading`: Whether to enable WebAssembly multithreading support

## Sources
- [Unity WebGL Documentation](https://docs.unity3d.com/Manual/webgl-building.html)
- [Unity Server Config Documentation](https://docs.unity3d.com/6000.0/Documentation/Manual/webgl-server-configuration-code-samples.html)
