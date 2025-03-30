# GL Helper Documentation
Webgl2 helper made by Nicholas Drew Thompson

Version: 1.1.0

Setup:
```javascript
import * as GLH from "glHelper";

const canvas = new GLH.Canvas(window.screen.width, window.screen.height);

const geometry = new GLH.Geometry([ // Vertices
        50, 50, 50, 100, 100, 100, // Triangle1 screen-space
        50, 50, 100, 50, 50, 100 // Triangle2 screen-space
    ], [ // Texture mapping
        0, 0, 0, 1, 1, 1, // Triangle1  clip-space
        0, 0, 1, 0, 0, 1 // Triangle2  clip-space
]);

const texture = new GLH.Texture({
    texture: "./myfolder/myfile.png", // Link to texture | default: color
    color: [255, 0, 0, 1], // Fallback color | default: transparent
    lowTexture: false // true: small image | false (default): normal/large image
});

const object = new GLH.Object(geometry, texture);
canvas.add(object);

function render() {
    canvas.render(); // render webgl2 canvas
    requestAnimationFrame(render);
}
render();
```

glHelper is a tool to make rendering with triangles an easy task.

Later updates may include vertex and fragment shader source control, more texturing options, and/or easier to use geometries.

Install with `npm install glhelper`