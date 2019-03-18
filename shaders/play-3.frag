precision highp float;

#define MAX_STEPS 100
#define MAX_DIST 200.0
#define SURF_DIST 0.01

#import "util/pi.glsl"
#import "util/atan360.glsl"
#import "util/hsl2rgb.glsl"
#import "util/sdSphere.glsl"
#import "util/sdBox.glsl"
#import "util/sdTorus.glsl"
#import "util/sdHexPrism.glsl"
#import "util/sdCappedCylinder.glsl"
#import "util/sdOctahedron.glsl"
#import "util/rotate.glsl"
#import "util/rotateAxis.glsl"

// uniforms
varying vec2 iCoords;
uniform vec3 iCamPos;
uniform mat3 iCamRot;
uniform vec3 iWindow;
uniform vec3 iRect;
uniform float iTime;
uniform vec4 iMods;

vec3 lightPos = vec3(0,0,0);
vec3 fogColor = vec3(0,0,0);

float grid_dist = 20.0;
float hue;
int hit = 0;
vec3 moonPos = vec3(0.0);
float iters = 35.0;

float shape = 0.0;
float shapeTime = PI * 0.15;
mat3 rot;
mat3 roti;

float smin( float a, float b, float k ) {
    float h = clamp( 0.5+0.5*(b-a)/k, 0., 1. );
    return mix( b, a, h ) - k*h*(1.0-h);
}

vec3 boxFold(vec3 p, float s){
	return clamp(p,-s,s)*2.0-p;
}

float dist(vec3 point){
	hit = 0;
	float sd = sdSphere(point, 2.0);
	
	float bd;
	vec3 p = rot * point;
	p.xz = rotate(iTime*0.25) * p.xz;
		
	if(shape == 0.0){		
		bd = sdTorus(p, vec2(1.8, 0.2));
	} else if(shape == 1.0){
		bd = sdCappedCylinder(p, vec2(1.8, 0.02))-0.03;
	} else if(shape == 2.0){	
		bd = max(sd, -sdSphere(vec3(point.x-1.5, point.y, point.z-1.5), 1.5));	
	} else if(shape == 3.0){	
		bd = min(sdTorus(rot*vec3(p.x, p.yz), vec2(1.8,0.15)), sdSphere(vec3(p.x, p.yz), 1.0));
	} else if(shape == 4.0){	
		bd = sdHexPrism(rotateAxis(PI/2.0,vec3(1,0,0))*p, vec2(2.0, 0.25))-0.01;
	} else if(shape == 5.0){			
		bd = sdBox(p, vec3(1,1,1))-0.05;;
	} else if(shape == 6.0){			
		bd = max(sd, -sdBox(rotateAxis(0.5,vec3(1.0,0.0,2.8))*point, vec3(0.5, 0.5, 3.5))+0.2);	
	} else if(shape == 7.0){
		bd = sdOctahedron(p, 2.0)-0.01;
	} else if(shape == 8.0){
		bd = min(sdTorus(rot*vec3(p.x+2.25, p.yz), vec2(1.0,0.1)), sdTorus(roti*vec3(p.x-2.25, p.yz), vec2(1.0,0.1)));
	} else {	
		bd = sdSphere(boxFold(boxFold(boxFold(rotateAxis(0.6,vec3(1,0,1))*p,0.2), 0.2), 0.2), 0.2);
	} 
	
	
	
	sd = mix(sd, bd, clamp((sin(iTime*shapeTime+PI*1.5)+0.5)*1.5, 0.0, 1.0));

	float md = sdSphere(point-moonPos, 0.2);
		
	if(sd < md){
		hit = 1;
		return sd;
	}
	hit = 2;
	return md;
		
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
    float fogAmount = clamp(1.0 - exp((-distance+80.0)*0.025), 0.0, 1.0);
    return mix(rgb, fogColor, fogAmount);
}
float light(vec3 p) {
	vec3 l = normalize(lightPos-p);
	vec3 n = normal(p);
	float dif = clamp(dot(n, l), 0., 1.);
	float d = raymarch(p+n*SURF_DIST*2., l);
	if(d<length(lightPos-p)) dif *= 0.1;
	dif = max(0.05, dif);
	return dif;
}

float mandel(vec2 c, float m){
	vec2 z = vec2(0.0);
	for(float i = 0.; i < 100.0; i++){
		if(i >= iters) break;
		z = vec2(z.x*z.x - z.y*z.y, m*z.x*z.y) + c;
		if(length(z) > 4.0){
			return i+1.0;
		}
	}
	return 0.0;
}

void main() {
	rot = rotateAxis(0.5, vec3(1.0, 0.0, -1.0));
	roti = rotateAxis(0.5, vec3(1.0, 0.0, +1.0));
	shape = floor(mod(iTime * shapeTime / PI2, 10.0));
	moonPos.z += 3.0;
	moonPos.xz = rotate(iTime*0.5) * moonPos.xz;
	moonPos.yz = rotate(0.1) * moonPos.yz;
	vec2 coords = vec2(iCoords.x*iRect.z, iCoords.y);
	vec3 rayOrigin = iCamPos;
	vec3 rayDir = iCamRot * normalize(vec3(coords.x, coords.y, -1.0));
	iters = 25.0 + sin(iTime*2.0) * 12.0;
	//lightPos = vec3(10.0, 0.0, 10.0);
//	lightPos = iCamPos;
	lightPos = vec3(0.0, 0.0, 10.0);
//	lightPos.xz = rotate(iTime*0.15) * lightPos.xz;
	float distance = raymarch(rayOrigin, rayDir);
	int hitt = hit;
	vec3 point = rayOrigin + rayDir * distance;	
	float sat = 0.666;
	float color = light(point);
	vec3 p = point;
	hue = 0.0;
	if(hitt == 1){
		p = rot * p;
		p.xz = rotate(iTime*0.25) * p.xz;
	//	p = rotateAxis(iTime, vec3(1.0, 1.0, 1.0)) * p;
		float a0 = atan(p.y, length(p.xz));
		float b0 = atan(p.z, p.x);
		float b1 = atan360(p.z, p.x);
		
	//	hue = 0.0; // clamp((b0+PI)/PI2, 0.0, 1.0);
	//	hue = clamp(b1/PI2, 0.0, 1.0);
		float re = b1/PI2*4.0 - 2.0;
		float im = (a0*2.0+PI)/PI2*2.0 - 1.0;
	//	float zoom = sin(iTime)*0.25 + 1.0;
		hue = 0.3;
		float res = mandel(rotate(-0.5)*vec2(-re, im)*1.5, 2.0);
		if(res > 0.0) res = mandel(rotate(-2.0)*vec2(-re+1.5, im-0.2)*5.0, 2.1);
		if(res > 0.0) res = mandel(rotate(1.0)*vec2(-re-1.6, im)*3.5, 1.7);
		hue = res == 0.0 ? 0.3 + sin(b0*4.0) * 0.1 : sin(a0*4.0)*0.02+0.6;
		//if(res > 10.0) hue = 1.0;
		if(abs(a0)+sin(b1*10.0)*0.02+sin(b1*5.0)*0.03+sin(b1)*0.1 > 1.3) color = 0.9;
	} else if(hitt == 2){
		p -= moonPos;
	//	p.xy = rotate(0.25) * p.xy;
		p.xz = rotate(iTime*1.5) * p.xz;
		p.yz = rotate(0.2) * p.yz;
		float a0 = atan(p.y, length(p.xz));
		float b0 = atan(p.z, p.x);
		float b1 = atan360(p.z, p.x);
		sat = 0.0;
		color = clamp(color-abs(sin(a0*6.0+b0*2.0)*0.1), 0.05, 1.0);
	}
	
	vec3 rgb = hsl2rgb(vec3(mod(hue, 1.0), sat, color));
	rgb = applyFog(rgb, distance);	
	gl_FragColor = vec4(rgb, 1.0);
}
