#define MAX_STEPS 100
#define MAX_DIST 200.0
#define SURF_DIST 0.01

#import "util/hsl2rgb.glsl"

uniform vec4 iMods;

vec3 lightPos = vec3(0,0,0);
vec3 fogColor = vec3(0,0,0);

float grid_dist = 20.0;

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
float sdSphere(vec3 p, float r){
    return length(p)-r;
}

float dist(vec3 point){
		
	float pd = point.y;
	
	vec3 p = point;
	p.y -= 1.7 + sin(iTime) * 6.0-2.0;
	
	p.xz = rotate(iTime) * p.xz;
	p.x += 10.0;
	
	float sd = sdSphere(p, 3.0);
	
	vec3 pb = p;
	pb.x += sin(iTime)*3.0;
	pb.z += cos(iTime)*sin(iTime)*3.0;
	pb.xz = rotate(iTime) * pb.xz;
		
	float bd = mix(sdBox(pb, vec3(2.0,2.0,2.0)), sdSphere(pb, 2.0), 0.9) - 0.2;
	
	return smin(pd, smin(bd,sd,.5),2.0);
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
	return dif;
}
void main() {
	vec2 coords = vec2(iCoords.x*iResolution.z, iCoords.y);
	vec3 rayOrigin = iCamPos;
	vec3 rayDir = iCamRot * normalize(vec3(coords.x, coords.y, -1.0));
	lightPos = vec3(0.0,10.0,0.0);
//	lightPos.xz = rotate(iTime*0.2) * lightPos.xz;
	float distance = raymarch(rayOrigin, rayDir);
	vec3 point = rayOrigin + rayDir * distance;	
	float color = light(point);
//	float id = floor((iTime+1.25)/(3.141*2.0));
//	float hue = id*0.5+0.5;
	float hue = 0.5;
	if(abs(point.y) > SURF_DIST){
		hue = mix(hue, 1.0, clamp(point.y*10.0, 0.0, .75));
	} 
	vec3 rgb = hsl2rgb(vec3(mod(hue, 1.0), 0.666, color));
	rgb = applyFog(rgb, distance);	
	gl_FragColor = vec4(rgb, 1.0);
}
