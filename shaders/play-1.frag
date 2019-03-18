precision highp float;

#define MAX_STEPS 100
#define MAX_DIST 1000.0
#define SURF_DIST 0.01

#import "util/hsl2rgb.glsl"

// uniforms
varying vec2 iCoords;
uniform vec3 iCamPos;
uniform mat3 iCamRot;
uniform vec3 iWindow;
uniform vec3 iRect;
uniform float iTime;
uniform vec4 iMods;

vec3 lightPos = vec3(0,0,0);
vec3 fogColor;

const float grid_dist = 10.0;

mat2 rotate(float angle){
	float c = cos(angle);
	float s = sin(angle);
	return mat2(c,s,-s,c);
}

float smin( float a, float b, float k ) {
    float h = clamp( 0.5+0.5*(b-a)/k, 0., 1. );
    return mix( b, a, h ) - k*h*(1.0-h);
}

float sdBox(vec3 p, vec3 b){
    vec3 d = abs(p) - b;
    return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));
}

float dist(vec3 point){
	float id = floor(point.x/grid_dist+0.5) + floor(point.z/grid_dist+0.5);
	float angle = -id*0.2+iTime;
	point.x = mod(point.x + grid_dist/2.0, grid_dist) - grid_dist/2.0;
	point.y = mod(point.y + grid_dist/2.0, grid_dist) - grid_dist/2.0;
	point.z = mod(point.z + grid_dist/2.0, grid_dist) - grid_dist/2.0;	
	point.xz = rotate(angle) * point.xz;
	
	vec4 sphere = vec4(0.0, 0.0, 0.0, 1.5);
	float sd = length(sphere.xyz-point) - sphere.w;
	
	float size = abs(sin(iTime*2.0)*0.5+1.0 * (sin(id)*0.36183+1.5)-1.0);
	float bd = sdBox(point-vec3(0.0, 0.0, 0.0), vec3(size)); 
		
	return mix(sd, bd, sin(iTime+id*2.0)*0.5+0.5);
}
float raymarch(vec3 rayOrigin, vec3 rayDir){
	float d_marched = 0.0;
	for(int i = 0; i < MAX_STEPS; i++){
		vec3 point = rayOrigin + rayDir * d_marched;
		float d_step = dist(point);
		d_marched += d_step;
		if(d_marched > MAX_DIST || d_step < SURF_DIST){
			break;
		}
	}
	return d_marched;
}
vec3 normal(vec3 p) {
	float d = dist(p);
	vec2 e = vec2(.01, 0);		
	vec3 n = d - vec3(
		dist(p-e.xyy),
		dist(p-e.yxy),
		dist(p-e.yyx));		
	return normalize(n);
}
vec3 applyFog(in vec3  rgb, in float distance){
    float fogAmount = clamp(1.0 - exp((-distance+150.0)*0.025), 0.0, 1.0);
    return mix(rgb, fogColor, fogAmount);
}
float light(vec3 p) {
//	if(length(iCamPos-p) > MAX_DIST*0.2) return 0.0;
	vec3 l = normalize(lightPos-p);
	vec3 n = normal(p);
	float dif = clamp(dot(n, l), 0., 1.);
//	float d = raymarch(p+n*SURF_DIST*2., l);
//	if(d<length(lightPos-p)) dif *= 0.1;
	return dif;
}
void main() {
	vec2 coords = vec2(iCoords.x*iRect.z, iCoords.y);		
	vec3 rayOrigin = iCamPos;
	vec3 rayDir = iCamRot * normalize(vec3(coords.x, coords.y, -1.0));		
//	lightPos = vec3(0,4,0);
	lightPos = vec3(iCamPos.x, iCamPos.y, iCamPos.z);
	float distance = raymarch(rayOrigin, rayDir);
	vec3 point = rayOrigin + rayDir * distance;
	float color = light(point);
//	float color = dist(point) <= SURF_DIST ? 1.0 : 0.0;
//	float red = abs(floor(point.x/7.5+0.5)*0.1)*color;
	float id = floor(point.y/grid_dist+0.5) + floor(point.z/grid_dist+0.5);
	float hue = sin(id)*0.5+0.5;
	fogColor = hsl2rgb(vec3(mod(iTime*0.1, 1.0), 0.3, 0.1));
	vec3 rgb = hsl2rgb(vec3(hue, 0.666, color));
	rgb = applyFog(rgb, distance);	
	gl_FragColor = vec4(rgb, 1.0);
}
