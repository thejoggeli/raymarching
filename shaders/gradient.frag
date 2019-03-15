precision highp float;
varying vec2 iCoords;
uniform vec3 iRect;
uniform vec3 iCamPos;
uniform mat3 iCamRot;
uniform float iTime;

void main() {
	vec2 uv = vec2(iCoords.x*iRect.z, iCoords.y);	
	vec4 color;
	color.x = sin(iTime)*0.5+0.5;
	color.y = sin(length(iCamPos))*0.5+0.5;
	color.z = cos(length(uv*50.0))*0.5+0.5;
	color.w = 1.0;
	color.xyz = abs(iCamRot * vec3(0.0, 0.0, -1.0));
	color.x = sin(uv.x+color.x - 0.5)*0.5+0.5;
	color.y = sin(uv.y+color.y - 0.5)*0.5+0.5;
	color.z = sin(iTime)*0.5+0.5;
	gl_FragColor = color;
}