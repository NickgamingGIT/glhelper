export class Canvas {
    constructor(width, height, vertexSource = null, fragmentSource = null) {
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        document.body.appendChild(this.canvas);

        this.gl = this.canvas.getContext('webgl2');
        if (!this.gl) {
            throw new Error("WebGL2 is not supported in this environment.");
        }

        this.objects = [];
        this.program = null;

        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

        // Allow users to provide custom shaders or use default ones
        this.vertexSource = vertexSource || `
            attribute vec2 position;
            attribute vec2 texCoord;
            uniform vec2 resolution;
            varying vec2 v_texCoord;
            void main() {
                vec2 clipSpace = (position / resolution) * 2.0 - 1.0;
                gl_Position = vec4(clipSpace * vec2(1, -1), 0.0, 1.0);
                v_texCoord = texCoord;
            }
        `;
        this.fragmentSource = fragmentSource || `
            precision mediump float;
            varying vec2 v_texCoord;
            uniform sampler2D u_texture;
            void main() {
                gl_FragColor = texture2D(u_texture, v_texCoord);
            }
        `;

        this._initializeShaders();
    }

    _initializeShaders() {
        const gl = this.gl;
        const vertexShader = this._compileShader(this.vertexSource, gl.VERTEX_SHADER);
        const fragmentShader = this._compileShader(this.fragmentSource, gl.FRAGMENT_SHADER);

        this.program = gl.createProgram();
        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);
        gl.linkProgram(this.program);

        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            const error = gl.getProgramInfoLog(this.program);
            gl.deleteProgram(this.program);
            throw new Error(`Error linking program: ${error}`);
        }

        gl.useProgram(this.program);

        const resolutionLocation = gl.getUniformLocation(this.program, 'resolution');
        gl.uniform2f(resolutionLocation, this.canvas.width, this.canvas.height);
    }

    _compileShader(source, type) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const error = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error(`Error compiling shader: ${error}`);
        }

        return shader;
    }

    add(object) {
        object.initialize(this.gl, this.program);
        this.objects.push(object);
    }

    render() {
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.objects.forEach(object => object.draw(this.gl, this.program));
    }
}

export class Geometry {
    constructor(vertices, texCoords) {
        this.vertices = vertices;
        this.texCoords = texCoords;
        this.vertexBuffer = null;
        this.texCoordBuffer = null;
    }

    initialize(gl) {
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.DYNAMIC_DRAW);

        this.texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.texCoords), gl.DYNAMIC_DRAW);
    }

    updateBuffer(gl) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.DYNAMIC_DRAW);
    }

    bind(gl, program) {
        const positionLocation = gl.getAttribLocation(program, 'position');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        const texCoordLocation = gl.getAttribLocation(program, 'texCoord');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        gl.enableVertexAttribArray(texCoordLocation);
        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
    }
}

export class Texture {
    constructor({ texture, color = [0, 0, 0, 0], lowTexture = false }) {
        this.texturePath = texture;
        this.fallbackColor = color;
        this.lowTexture = lowTexture;
        this.texture = null;
    }

    initialize(gl) {
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        const fallbackData = new Uint8Array([
            this.fallbackColor[0],
            this.fallbackColor[1],
            this.fallbackColor[2],
            Math.round(this.fallbackColor[3] * 255)
        ]);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            1,
            1,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            fallbackData
        );

        if (this.texturePath) {
            const image = new Image();
            image.onload = () => {
                gl.bindTexture(gl.TEXTURE_2D, this.texture);
                gl.texImage2D(
                    gl.TEXTURE_2D,
                    0,
                    gl.RGBA,
                    gl.RGBA,
                    gl.UNSIGNED_BYTE,
                    image
                );

                const filter = this.lowTexture ? gl.NEAREST : gl.LINEAR;
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
                gl.generateMipmap(gl.TEXTURE_2D);
            };
            image.src = this.texturePath;
        } else {
            const filter = this.lowTexture ? gl.NEAREST : gl.LINEAR;
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
        }
    }

    bind(gl, program) {
        const textureLocation = gl.getUniformLocation(program, 'u_texture');
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(textureLocation, 0);
    }
}

export class Object {
    constructor(geometry, texture) {
        this.geometry = geometry;
        this.texture = texture;
    }

    initialize(gl) {
        this.geometry.initialize(gl);
        this.texture.initialize(gl);
    }

    draw(gl, program) {
        this.geometry.updateBuffer(gl);
        this.geometry.bind(gl, program);
        this.texture.bind(gl, program);
        gl.drawArrays(gl.TRIANGLES, 0, this.geometry.vertices.length / 2);
    }
}