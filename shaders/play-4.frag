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

vec3 lightPos = vec3(0,0,0);
vec3 fogColor = vec3(0,0,0);

const float mandelHeight = 0.1;
const float mandelIterationsMax = 100.0;
float mandelIterations = 10.0;
float inSet;
float iters;

vec2 mandelMy(vec2 c){	
	vec2 z = vec2(0.0);
	for(float i = 1.; i <= mandelIterationsMax; i++){
		if(i > mandelIterations) break;
		z = vec2(z.x*z.x - z.y*z.y, 2.0*z.x*z.y) + c;
		if(length(z) > 4.0){
			return vec2(0.0, i);
		}
	}
	return vec2(1.0, 0.0);
}

vec2 complexMul(vec2 a, vec2 b){
	return vec2(a.x*b.x-a.y*b.y, a.x*b.y+a.y*b.x);
}

vec3 mandel(vec2 c){
	vec2 z = vec2(0.0, 0.0);
	vec2 dz = vec2(0.0, 0.0);
	float m2;
	for(float i = 0.; i < mandelIterationsMax; i++){
		if(i >= mandelIterations) break;
		dz = complexMul(vec2(2.0, 0.0), z);
		dz = complexMul(z, dz) + vec2(1.0, 0.0);
		z = complexMul(z, z) + c;
		m2 = length(z);
		if(m2>4.0) return vec3(0.0, i, sqrt(m2/length(dz))*0.5*log(m2));
	}
	// distance estimation: G/|G'|
	return vec3(1.0, mandelIterations, sqrt(m2/length(dz))*0.5*log(m2));
}
float getDist(vec3 point){
	vec2 mp = vec2(point.x, point.z)*0.1;
	vec3 mr = mandel(mp);
	inSet = mr.x;
	iters = mr.y;
		
	float fd = point.y;
	float cd = mandelHeight - point.y;
	float md = 	mr.z;
	
	return min(md, min(fd, cd));
	
	
/*	vec2 mr = mandel(mp);



	
	
	inSet = mr.x;
	iters = mr.y;
	float md;
	if(inSet){
		md = 0.0;
	} else {
		for(float i = 1.; i <= mandelIterationsMax; i++){
			if(i > mandelIterations){
				md = 0.0;
				break;
			}
			float z = mandelHeight * (i/mandelIterations);
		}
	}
	
	
	float md = mr.x == 1.0 ? 0.0 : 2.0; // mandelHeight * (iters/mandelIterations); // mr.y/(mandelIterations-1.0)*mandelHeight;
	md = point.y + md;
	return md; */
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
/*	vec3 camPos = vec3(iCamPos.x, 0.0, iCamPos.z+10.0);
	float top_d = doRaymarch(vec3(camPos.x, 100.0, camPos.z), vec3(0.0, -1.0, 0.0));
	float cam_y = 100.0 - top_d + 1.7;
	vec3 rayOrigin = vec3(camPos.x, cam_y, camPos.z);	 */
	
	float cspd = 0.1;
	vec3 rayOrigin = vec3(iCamPos.x*cspd-0.8, iCamPos.y*cspd+0.05, iCamPos.z*cspd+9.0);
	vec2 coords = vec2(iCoords.x*iResolution.z, iCoords.y);
	vec3 rayDir = iCamRot * normalize(vec3(coords.x, coords.y, -1.0));
	lightPos = vec3(rayOrigin.x, rayOrigin.y, rayOrigin.z);
	
	float distance = doRaymarch(rayOrigin, rayDir);
	float iters_ = iters;
	float inSet_ = inSet;
	vec3 point = rayOrigin + rayDir * distance;
	vec3 hsl = vec3(0.0, 0.666, getLight(point));
	
	if(inSet_ == 1.0) hsl.x = 0.5;
	
	vec3 rgb = hsl2rgb(hsl);
	rgb = applyFog(rgb, distance);	
	gl_FragColor = vec4(rgb, 1.0);
}
