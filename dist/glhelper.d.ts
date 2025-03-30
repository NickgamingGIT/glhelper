declare module "glhelper" {
    export class Canvas {
        constructor(
            width: number,
            height: number,
            vertexSource?: string | null,
            fragmentSource?: string | null
        );

        add(object: Object): void;
        render(): void;
    }

    export class Geometry {
        constructor(vertices: number[], texCoords: number[]);

        initialize(gl: WebGLRenderingContext): void;
        updateBuffer(gl: WebGLRenderingContext): void;
        bind(gl: WebGLRenderingContext, program: WebGLProgram): void;
    }

    export class Texture {
        constructor(options: {
            texture?: string;
            color?: [number, number, number, number];
            lowTexture?: boolean;
        });

        initialize(gl: WebGLRenderingContext): void;
        bind(gl: WebGLRenderingContext, program: WebGLProgram): void;
    }

    export class Object {
        constructor(geometry: Geometry, texture: Texture);

        initialize(gl: WebGLRenderingContext): void;
        draw(gl: WebGLRenderingContext, program: WebGLProgram): void;
    }
}