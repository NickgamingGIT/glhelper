# GL Helper

**GL Helper** is a lightweight utility designed to simplify rendering triangles using WebGL2. It provides an intuitive API for creating and managing WebGL2 canvases, geometries, textures, and objects.

## Features

- Easy-to-use WebGL2 canvas setup.
- Support for custom vertex and fragment shaders.
- Simplified geometry and texture management.
- Built-in fallback mechanisms for textures.
- Optimized for rendering triangles.

## Installation

You can use GL Helper via npm or a CDN.

### Using npm

Install the package via npm:

```bash
npm install glhelper
```

### Using a CDN

Include GL Helper in your project using a CDN:

- **jsDelivr**:
  ```html
  <script src="https://cdn.jsdelivr.net/npm/glhelper/dist/glhelper.js"></script>
  ```

- **unpkg**:
  ```html
  <script src="https://unpkg.com/glhelper/dist/glhelper.js"></script>
  ```

The library will be available globally as `GLH`.

## Usage

### Using a CDN in HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GL Helper Example</title>
    <script src="https://cdn.jsdelivr.net/npm/glhelper/dist/glhelper.js"></script>
</head>
<body>
    <script>
        // Create a WebGL2 canvas
        const canvas = new GLH.Canvas(window.innerWidth, window.innerHeight);

        // Define geometry (vertices and texture coordinates)
        const geometry = new GLH.Geometry(
            [50, 50, 50, 100, 100, 100, 50, 50, 100, 50, 50, 100], // Vertices
            [0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1]                  // Texture mapping
        );

        // Define texture with fallback color
        const texture = new GLH.Texture({
            texture: "./myfolder/myfile.png",
            color: [255, 0, 0, 1],
            lowTexture: false
        });

        // Create an object and add it to the canvas
        const object = new GLH.Object(geometry, texture);
        canvas.add(object);

        // Render loop
        function render() {
            canvas.render();
            requestAnimationFrame(render);
        }
        render();
    </script>
</body>
</html>
```

### Using npm with ES Modules

```javascript
import * as GLH from "glhelper";

// Create a WebGL2 canvas
const canvas = new GLH.Canvas(window.innerWidth, window.innerHeight);

// Define geometry (vertices and texture coordinates)
const geometry = new GLH.Geometry(
    [50, 50, 50, 100, 100, 100, 50, 50, 100, 50, 50, 100], // Vertices
    [0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1]                  // Texture mapping
);

// Define texture with fallback color
const texture = new GLH.Texture({
    texture: "./myfolder/myfile.png",
    color: [255, 0, 0, 1],
    lowTexture: false
});

// Create an object and add it to the canvas
const object = new GLH.Object(geometry, texture);
canvas.add(object);

// Render loop
function render() {
    canvas.render();
    requestAnimationFrame(render);
}
render();
```

## Future Enhancements

Planned updates for GL Helper include:

- **Post-Processing Effects**: Introduce effects like bloom, blur, or color grading.
- **Customizable Render Pipelines**: Allow users to define custom render pipelines for advanced use cases.
- **Geometry Utilities**: Add helper functions for generating common shapes like circles, grids, or polygons.
- **Texture Atlas Support**: Enable efficient rendering of multiple textures using a single texture atlas.
- **Performance Monitoring**: Provide tools to measure and optimize WebGL2 rendering performance.

## License

This project is licensed under the [MIT License](./LICENSE).

---
For more information, please refer to the source code or documentation.