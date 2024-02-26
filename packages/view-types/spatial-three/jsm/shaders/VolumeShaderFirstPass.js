import {
    Vector3, Matrix4
} from "../../node_modules/three/build/three.module.js";

var VolumeShaderFirstPass = {
    uniforms: {
        "u_vol_scale": {value: new Vector3(1, 1, 1)},
      //  "u_translate": {value: new Vector3(0.0,0.0,0.0)}
    },
    vertexShader: [
        "uniform vec3 u_vol_scale;",
        "uniform vec3 u_translate;",
        "varying vec3 worldSpaceCoords;",
        "",
        "void main() {",
        // "    u_transformMat = mat4(vec4(1.0,0.0,0.0,0.0),",
        // "                       vec4(0.0,1.0,0.0,0.0),",
        // "                       vec4(0.0,0.0,1.0,0.0),",
        // "                       vec4(u_translate[0],u_translate[1],u_translate[2],1.0));",
        "    worldSpaceCoords = position + vec3(0.5, 0.5, 0.5); //move it from [-0.5;0.5] to [0,1]",
        "    gl_Position = projectionMatrix * modelViewMatrix * vec4( position * u_vol_scale, 1.0 );",
        "    return;",
        "}",
    ].join("\n"),
    fragmentShader: [
        "varying vec3 worldSpaceCoords;",
        "void main()",
        "{",
            "//The fragment's world space coordinates as fragment output.",
            "gl_FragColor = vec4( worldSpaceCoords.x , worldSpaceCoords.y, worldSpaceCoords.z, 1.0 );",
            //"gl_FragColor = vec4( 1.0,1.0,1.0, 1.0 );",
        "}",
    ].join("\n")
};

export {VolumeShaderFirstPass};
