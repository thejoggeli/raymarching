#import "util/sdBox.glsl"
#import "util/sdSphere.glsl"
#import "util/sdCappedCylinder.glsl"
#import "util/sdTorus.glsl"
#import "util/rotate.glsl"
#import "util/vec4min.glsl"
#import "util/avgFrequency.glsl"
#import "util/hsl2rgb.glsl"
#import "util/smin.glsl"

#define MAX_STEPS 100
#define MAX_DIST 200.0
#define SURF_DIST 0.01

vec3 lightPos = vec3(0, 5, 0);
vec3 fogColor = vec3(0, 0, 0);

uniform sampler2D music;

float musicIntensity = 0.;
float musicScale = 0.;
float gridDist = 10.0;

int getColorId(vec3 point){	
	float fd = min(
		smin(
			max(point.y, -sdSphere(point, 2.5*musicScale+0.5)), 
			sdTorus(point, vec2(2.5*musicScale+0.125+0.5, 0.1)),
			0.35
		),
		20. - point.y
	);
	vec3 p = point + vec3(0, -1.5, 0.);	
	p.xz = rotate(iTime) * p.xz;
	p.xy = rotate(iTime*0.7343) * p.xy;
	p.yz = rotate(iTime*1.2132) * p.yz;
	float bd = sdBox(p, vec3(musicScale*0.5+0.5));	
	float sd = sdSphere(p, musicScale*0.5+0.5);
	float md = mix(sd, bd, musicScale);
	p = point + vec3(-8, -2, 0);	
//	p.xz = rotate(iTime*0.1) * p.xz;
//	p.x += sin(iTime+p.z);
	float bd2 = sdBox(p, vec3(2.0, 2.0, 16.0));	
	p = point + vec3(0, -2, -15);
	p.xz = rotate(sin(iTime)*0.25)*p.xz; 
	float bd3 = sdBox(p, vec3(1.75))-0.25;
	float sd3 = sdSphere(p, 2.0);
	float md2 = mix(bd3, sd3, clamp(sin(iTime), -0.1, 1.25));
	p = point + vec3(0, -2, 8);
	float sd2 = sdSphere(p, 2.0);
	p = point + vec3(0, -20, 0);
	float td = sdTorus(p, vec2(25., 4.0));
	p = point - vec3(0.0, 0.0, 5.5);
	float bd4 = sdBox(p, vec3(2.5, 0.25, 0.5));
	p = point - vec3(-8.0, 2.0, 0.0);
	p.xz = rotate(iMods0.x) * p.xz;
	p.xy = rotate(iMods0.y) * p.xy;
	float bd5 = sdBox(p, vec3(2.0, 2.0, 4.0));
	p.yz = rotate(3.141*0.5) * p.yz;
	float cd5 = sdCappedCylinder(p, vec2(2.0, 4.0));
	bd5 = mix(bd5, cd5, iMods0[2]);
	
	float ref = min(bd5, min(td, min(bd2, min(md2, sd2))));
	
	if(md < fd && md < ref && md < bd4) return 1; // md
	if(ref < md && ref < fd && ref < bd4) return 2; // bd2
	if(bd4 < md && bd4 < ref && bd4 < fd) return 3;
	return 0;
}
float getDist(vec3 point){	
	float fd = min(
		smin(
			max(point.y, -sdSphere(point, 2.5*musicScale+0.5)), 
			sdTorus(point, vec2(2.5*musicScale+0.125+0.5, 0.1)),
			0.35
		),
		20. - point.y
	);
	vec3 p = point + vec3(0, -1.5, 0.);	
	p.xz = rotate(iTime) * p.xz;
	p.xy = rotate(iTime*0.7343) * p.xy;
	p.yz = rotate(iTime*1.2132) * p.yz;
	float bd = sdBox(p, vec3(musicScale*0.5+0.5));	
	float sd = sdSphere(p, musicScale*0.5+0.5);
	float md = mix(sd, bd, musicScale);
	p = point + vec3(-8, -2, 0);
//	p.xz = rotate(iTime*0.1) * p.xz;
//	p.x += sin(iTime+p.z);
//	float bd2 = max(sdBox(p, vec3(2.0)), -sdBox(p, vec3(5.0, 1.0, 1.0)));	
/*	vec3 p2 = p;
	p2.xz = rotate(iTime) * p2.xz; *
	float bd2 = max(sdBox(p, vec3(2.0)), -sdBox(p2, vec3(5.0, 1.0, 1.0)));	 */
	float bd2 = sdBox(p, vec3(2.0, 2.0, 16.0));	
	p = point + vec3(0, -2, -15);
	p.xz = rotate(sin(iTime)*0.25)*p.xz;
	float bd3 = sdBox(p, vec3(1.75))-0.25;
	float sd3 = sdSphere(p, 2.0);
	float md2 = mix(bd3, sd3, clamp(sin(iTime), -0.1, 1.25));
	p = point + vec3(0, -2, 8);
	float sd2 = sdSphere(p, 2.0);	
	p = point + vec3(0, -20, 0);
	float td = sdTorus(p, vec2(25., 4.0));
	p = point - vec3(0.0, 0.0, 5.5);
	float bd4 = sdBox(p, vec3(2.5, 0.25, 0.5));
	p = point - vec3(-8.0, 2.0, 0.0);
	p.xz = rotate(iMods0.x) * p.xz;
	p.xy = rotate(iMods0.y) * p.xy;
	float bd5 = sdBox(p, vec3(2.0, 2.0, 4.0));
	p.yz = rotate(3.141*0.5) * p.yz;
	float cd5 = sdCappedCylinder(p, vec2(2.0, 4.0));
	bd5 = mix(bd5, cd5, iMods0[2]);
	return min(bd5, min(bd4, min(td, min(sd2, min(md2, min(bd2, min(fd, md)))))));
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
float edge = 0.0;
vec3 getNormal(vec3 p) {
	float d = getDist(p);
	vec2 e = vec2(.01, 0);		
	vec3 n = d - vec3(
		getDist(p-e.xyy),
		getDist(p-e.yxy),
		getDist(p-e.yyx));		
	return normalize(n);
}
bool getEdge(vec3 p){
	vec3 n = getNormal(p);
	float d = getDist(p+n*SURF_DIST*1.5);
	if(d < SURF_DIST*2.0){
		return true;
	}
	return false;
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
	dif = max(0.1, dif);
	return dif;
}
void main() {
	
	musicIntensity = avgFrequency(music, 0.0, 16000.0);
	musicScale = musicIntensity*2.0, 1.0;
	
	vec2 coords = vec2(iCoords.x*iResolution.z, iCoords.y);
	vec3 rayOri = iCamPos;
	vec3 rayDir = iCamRot * normalize(vec3(coords.x, coords.y, -1.0));
		
//	lightPos = vec3(10,10,0);
//	lightPos.xz = rotate(iTime) * lightPos.xz;
	lightPos = vec3(0,10,0);
	
	float distanceMarched = doRaymarch(rayOri, rayDir);
	vec3 point = rayOri + rayDir * distanceMarched;
	
	vec3 color = vec3(0.0);
			
	vec3 colorPoint = point;	
	vec3 colorDir = rayDir;
	
	for(int i = 0; i < 50; i++){
		int colorId = getColorId(colorPoint);	
		if(colorId == 0){
			color = vec3(1,1,1) * getLight(colorPoint);
			break;
		}
		else if(colorId == 1){
			vec3 rgb = hsl2rgb(vec3(0.15-(musicScale*0.3-0.15), 1.0, 0.5));
			color = rgb * getLight(colorPoint);
			break;
		}
		else if(colorId == 2){	
			vec3 normal = getNormal(colorPoint);
			vec3 reflection = colorDir - 2.0 * dot(colorDir, normal) * normal;
			colorPoint += reflection*SURF_DIST*2.0;
			float dist = doRaymarch(colorPoint, reflection);
			colorPoint = colorPoint + reflection * dist;
			colorDir = reflection;
		//	light *= max(0.5,getLight(colorPoint));
		} else if(colorId == 3){
			vec3 normal = getNormal(colorPoint);
			if(normal.y < 0.95){
				color = vec3(0,1,1) * getLight(colorPoint);				
			} else {
				// audio display
				float x = colorPoint.x / 5.0 + 0.5;
				vec4 c = texture2D(music, vec2(x/iAudio.x*16000., 0.5));
				color = vec3(0, c.x, c.x);						
			}
		}
	}
	
/*	if(getEdge(colorPoint)){
		gl_FragColor = vec4(0,0,0,1);
	} else {
		gl_FragColor = vec4(color.rgb, 1.0);		
	} */
	
	gl_FragColor = vec4(color.rgb, 1.0);	
	 
/*	vec2 screenCoords = vec2(iCoords.x+0.5, -iCoords.y+0.5);	
	if(screenCoords.y > 0.9){
		vec4 c = texture2D(music, vec2(screenCoords.x/iAudio.x*16000., 0.5));
		gl_FragColor = c;
	}  */
	
}
