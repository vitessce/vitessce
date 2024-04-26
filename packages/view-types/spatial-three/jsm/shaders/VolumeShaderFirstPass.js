import {
    Vector3
} from "../../node_modules/three/build/three.module.js";

var VolumeShaderFirstPass = {
    uniforms: {
        "u_vol_scale":  {value: new Vector3(1, 1, 1)},
    },
    vertexShader: [
        "uniform vec3 u_vol_scale;",
        "varying vec3 worldSpaceCoords;",
        "void main()",
        "{",
         "  worldSpaceCoords = position / vec3(245.0,274.0,37.0)  + vec3(0.5, 0.5, 0.5); //move it from [-0.5;0.5] to [0,1]",
            "gl_Position = projectionMatrix * modelViewMatrix * vec4( position , 1.0 );",
        "}",
    ].join("\n"),
    fragmentShader: [
        "varying vec3 worldSpaceCoords;",
        "void main()",
        "{",
            "//The fragment's world space coordinates as fragment output.",
            "gl_FragColor = vec4( worldSpaceCoords.x , worldSpaceCoords.y, worldSpaceCoords.z, 1.0 );",
        "}",
    ].join("\n")
};

export {VolumeShaderFirstPass};