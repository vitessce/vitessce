import {
    Vector3
} from "../../node_modules/three/build/three.module.js";

var VolumeShaderGeom = {
    uniforms: {
    },
    vertexShader: [
        "varying vec3 worldSpaceCoords;",
        "void main()",
        "{",
        "   worldSpaceCoords = position + vec3(0.5, 0.5, 0.5); //move it from [-0.5;0.5] to [0,1]",
        "   gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
        "}"
    ].join("\n"),
    fragmentShader: [
        "varying vec3 worldSpaceCoords;",
        "    void main()",
        "    {",
        "       gl_FragColor = vec4( worldSpaceCoords.x , worldSpaceCoords.y, worldSpaceCoords.z, 1.0 );",
        "    }",
    ].join("\n")
};

export {VolumeShaderGeom};
