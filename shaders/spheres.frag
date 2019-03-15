#define MAX_STEPS 100
#define MAX_DIST 100.0
#define SURF_DIST 0.01
#define BOX_SIZE 0.2
precision highp float;
varying vec2 iCoords;
uniform vec3 iCamPos;
uniform mat3 iCamRot;
uniform vec3 iWindow;
uniform vec3 iRect;
uniform float iTime;
uniform vec4 iMods;
float raymarch(vec3 ray_origin, vec3 ray_dir);
vec3 light_pos = vec3(0,0,0);
float spheres(vec3 point){
	point.y += 1.0;
	point = clamp(point, -5.0, 5.0) * 2.0 - point;		
	vec4 sphere1 = vec4(0.0, 1.0, -8.0, 1.0*iMods.x);
	vec4 sphere2 = vec4(4.5, 3.0, -6.0, 2.0);
	float sd1 = length(vec3(sin(point.x)*(0.9+sin(iTime*sin(iTime*0.5)*2.5*sqrt(point.y+abs(point.x)))*0.1)*sphere1.w, mod(point.y, 2.0*iMods.x), point.z)-sphere1.xyz)-sphere1.w;
	float sd2 = length(point-sphere2.xyz)-sphere2.w;
	float pd = point.y;
	return min(pd, min(sd1, sd2));		
}	
float fold(float v){
	if(v > BOX_SIZE) return BOX_SIZE*2.0 - v;
	if(v < -BOX_SIZE) return -BOX_SIZE*2.0 - v;
	return v;
}	
vec3 fold2(vec3 point){
	float mag = length(point);
	if(mag > 10.0){
		point *= 1.0/(mag*mag);
	}
	return point;
}
float fractal(vec3 point){
/* 	vec4 sphere = vec4(0.0, 0.0, 0.0, 1.0);
	for(int i = 0; i < 5; i++){
		sphere.w = fold(point.x+sin(length(point.yz)));
		sphere.w = fold(point.y+sin(length(point.xz)));
		sphere.w = fold(point.z+sin(length(point.xy)));
	}
	return length(point-sphere.xyz)-sphere.w; */
	vec4 sphere = vec4(0.0, 0.0, 0.0, 1.0);
	for(int i = 0; i < 1; i++){
		point.x = fold(point.x);
		point.y = fold(point.y);
		point.z = fold(point.z);
		point.x += sin(length(point));
	//	point = fold2(point);
	}
	return length(point-sphere.xyz)-sphere.w;
}
#define minRadius2 0.5
#define fixedRadius2 1.0
#define foldingLimit 1.0
#define Iterations 20
#define Scale 2.0
void sphereFold(inout vec3 z, inout float dz) {
	float r2 = dot(z,z);
	if (r2<minRadius2) { 
		// linear inner scaling
		float temp = (fixedRadius2/minRadius2);
		z *= temp;
		dz*= temp;
	} else if (r2<fixedRadius2) { 
		// this is the actual sphere inversion
		float temp = (fixedRadius2/r2);
		z *= temp;
		dz*= temp;
	}
}
void boxFold(inout vec3 z, inout float dz) {
	z = clamp(z, -foldingLimit, foldingLimit) * 2.0 - z;
}
float mandelbox(vec3 z){
	vec3 offset = z;
	float dr = 1.0;
	for (int n = 0; n < Iterations; n++) {
		boxFold(z,dr);       // Reflect
		sphereFold(z,dr);    // Sphere Inversion			
		z=Scale*z + offset;  // Scale & Translate
		dr = dr*abs(Scale)+1.0;
	}
	float r = length(z);
	return r/abs(dr);
}
float dist(vec3 point){
	return spheres(point);
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
	vec3 l = normalize(light_pos-p);
	vec3 n = normal(p);
	float dif = clamp(dot(n, l), 0., 1.);
	float d = raymarch(p+n*SURF_DIST*2., l);
	if(d<length(light_pos-p)) dif *= .1;
	return dif;
}
float raymarch(vec3 ray_origin, vec3 ray_dir){
	float d_marched = 0.0;
	for(int i = 0; i < MAX_STEPS; i++){
		vec3 point = ray_origin + ray_dir * d_marched;
		float d_step = dist(point);
		d_marched += d_step;
		if(d_marched > MAX_DIST || d_step < SURF_DIST){
			break;
		}
	}
	return d_marched;
}
void main() {
	vec2 coords = vec2(iCoords.x*iRect.z, iCoords.y);		
	vec3 ray_origin = iCamPos;
	vec3 ray_dir = iCamRot * normalize(vec3(coords.x, coords.y, -1.0));		
	light_pos = iCamPos;
	light_pos.y += 5.0;
//	light_pos.xz += vec2(sin(iTime), cos(iTime))*5.;
//	light_pos.y += 3.0;
	float distance = raymarch(ray_origin, ray_dir);
	vec3 point = ray_origin + ray_dir * distance;
	float color = light(point);
	gl_FragColor = vec4(color, color, color, 1.0);
}