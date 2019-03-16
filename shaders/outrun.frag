#define MAX_STEPS 100
#define MAX_DIST 20.0
#define SURF_DIST 0.01

precision highp float;

// uniforms
varying vec2 iCoords;
uniform vec3 iCamPos;
uniform mat3 iCamRot;
uniform vec3 iWindow;
uniform vec3 iRect;
uniform float iTime;
uniform vec4 iMods;

vec3 lightPos = vec3(0,0,0);

mat2 rotate(float angle){
	float c = cos(angle);
	float s = sin(angle);
	return mat2(c,s,-s,c);
}

vec3 repxz(in vec3 p, in vec2 factor){
	vec2 tmp = mod(p.xz, factor) - 0.5*factor;
	return vec3(tmp.x, p.y, tmp.y);
}
vec3 repx(in vec3 p, float factor){
	float tmp = mod(p.x, factor) - 0.5*factor;
	return vec3(tmp, p.y, p.z);
}
vec3 repz(in vec3 p, float factor){
	float tmp = mod(p.z, factor) - 0.5*factor;
	return vec3(p.x, p.y, tmp);
}

float sdBox(vec3 p, vec3 b){
    vec3 d = abs(p) - b;
    return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));
}

float dist(vec3 point){
	vec4 sphere = vec4(0.0, 1.5, -5.0, 1.5);
	float sd = length(sphere.xyz-point) - sphere.w;
	
	vec3 p = repx(point, 1.0);
	float pd1 = sdBox(p, vec3(0.1, 0.01, 10.0));
	
	p = repz(point, 1.0);
	float pd2 = sdBox(p, vec3(10.0, 0.01, 0.1));
	
	return min(pd1, min(pd2, sd));
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
float light(vec3 p) {		
	vec3 l = normalize(lightPos-p);
	vec3 n = normal(p);
	float dif = clamp(dot(n, l), 0., 1.);
	float d = raymarch(p+n*SURF_DIST*2., l);
	if(d<length(lightPos-p)) dif *= .1;
	return dif;
}
void main() {
	vec2 coords = vec2(iCoords.x*iRect.z, iCoords.y);		
	vec3 rayOrigin = iCamPos;
	vec3 rayDir = iCamRot * normalize(vec3(coords.x, coords.y, -1.0));		
//	lightPos = vec3(cos(iTime), 10.0, sin(iTime));
	lightPos = vec3(iCamPos.x, iCamPos.y + 1.0, iCamPos.z);
	float distance = raymarch(rayOrigin, rayDir);
	vec3 point = rayOrigin + rayDir * distance;
	float color = light(point);
	gl_FragColor = vec4(color, color, color, 1.0);
}
