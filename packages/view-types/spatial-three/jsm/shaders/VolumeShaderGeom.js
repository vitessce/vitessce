import {
    Vector3
} from "../../node_modules/three/build/three.module.js";

var VolumeShaderGeom = {
    uniforms: {
        "u_color": {value: new Vector3(1, 1, 1)},
        "u_vol_scale": {value: new Vector3(1, 1, 1)},
    },
    vertexShader: [
        "uniform vec3 u_vol_scale;",
        "varying vec3 worldSpaceCoords;",
        "",
        "void main() {",
        "    worldSpaceCoords = position + vec3(0.5, 0.5, 0.5); //move it from [-0.5;0.5] to [0,1]",
        "    gl_Position = projectionMatrix * modelViewMatrix * vec4( position * u_vol_scale, 1.0 );",
        "    return;",
        "}",
    ].join("\n"),
    fragmentShader: [
        "uniform vec3 u_color;",
        "",
        "    void main()",
        "    {",
        "        gl_FragColor = vec4( u_color, 1.0 );",
        "    }",
    ].join("\n")
};

export {VolumeShaderGeom};
