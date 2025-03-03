out vec3 rayDirUnnorm;
out vec3 cameraCorrected;
uniform vec3 u_vol_scale;
uniform vec3 u_size;
varying vec3 worldSpaceCoords;
varying vec2 vUv;
varying vec4 glPosition;
uniform highp vec3 boxSize;
void main()
{
   worldSpaceCoords = position / boxSize + vec3(0.5, 0.5, 0.5); //move it from [-0.5;0.5] to [0,1]
   cameraCorrected = (inverse(modelMatrix) * vec4(cameraPosition, 1.)).xyz;
   rayDirUnnorm = position - cameraCorrected;
   gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
   glPosition = gl_Position;
   vUv = uv;
}
