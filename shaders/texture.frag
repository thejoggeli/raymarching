
#define MAX_STEPS 100
#define MAX_DIST 200.0
#define SURF_DIST 0.01

#import "util/pi.glsl"
#import "util/hsl2rgb.glsl"
#import "util/sdBox.glsl"
#import "util/sdSphere.glsl"
#import "util/rotate.glsl"

// uniforms
uniform vec4 iMods;
uniform sampler2D iTexture;
uniform sampler2D iMusic;
uniform sampler2D iFreq;

vec3 lightPos = vec3(0,0,0);
vec3 fogColor = vec3(0,0,0);

float getDist(vec3 point){
	return point.y;
}
float doRaymarch(vec3 rayOrigin, vec3 rayDir){
	float d_marched = 0.0;
	for(int i = 0; i < MAX_STEPS; i++){
		vec3 point = rayOrigin + rayDir * d_marched;
		float d_step = getDist(point);
		d_marched += d_step;
		if(d_marched > MAX_DIST || d_step < SURF_DIST){
			break;
		}
	}
	return d_marched;
}
vec3 getNormal(vec3 p) {
	float d = getDist(p);
	vec2 e = vec2(.01, 0);		
	vec3 n = d - vec3(
		getDist(p-e.xyy),
		getDist(p-e.yxy),
		getDist(p-e.yyx));		
	return normalize(n);
}
vec3 applyFog(in vec3  rgb, in float distance){
	float fogAmount = clamp(1.0 - exp((-distance+80.0)*0.025), 0.0, 1.0);
	return mix(rgb, fogColor, fogAmount);
}
float getLight(vec3 p) {
	vec3 l = normalize(lightPos-p);
	vec3 n = getNormal(p);
	float dif = clamp(dot(n, l), 0., 1.);
	float d = doRaymarch(p+n*SURF_DIST*2., l);
	if(d<length(lightPos-p)) dif *= 0.1;
	dif = max(0.05, dif);
	return dif;
}
void main() {	
	vec3 rayOrigin = iCamPos;
	vec2 coords = vec2(iCoords.x*iResolution.z, iCoords.y);
	vec3 rayDir = iCamRot * normalize(vec3(coords.x, coords.y, -1.0));
	lightPos = vec3(rayOrigin.x, rayOrigin.y, rayOrigin.z);
	float distance = doRaymarch(rayOrigin, rayDir);
	vec3 point = rayOrigin + rayDir * distance;
	float light = getLight(point);
	vec2 texCoords;
	texCoords.x = mod(abs(point.x)*0.1,1.0);
	texCoords.y = mod(abs(point.z)*0.1,1.0);
	vec4 rgba = texture2D(iTexture, texCoords);
	rgba.xyz = rgba.xyz * light;
	rgba.xyz = applyFog(rgba.xyz, distance);
	gl_FragColor = rgba;
	
	vec2 screenCoords = vec2(iCoords.x+0.5, -iCoords.y+0.5);
	
	if(screenCoords.y > 0.8 && screenCoords.y < 0.9){
		gl_FragColor = texture2D(iMusic, vec2(screenCoords.x, 0.5));
	}
	
	if(screenCoords.y > 0.6 && screenCoords.y < 0.7){
		gl_FragColor = texture2D(iFreq, vec2(screenCoords.x, 0.5));
	}
	
}
