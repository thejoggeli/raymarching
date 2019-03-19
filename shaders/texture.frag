
#define MAX_STEPS 100
#define MAX_DIST 200.0
#define SURF_DIST 0.01

#import "util/pi.glsl"
#import "util/hsl2rgb.glsl"
#import "util/sdBox.glsl"
#import "util/sdSphere.glsl"
#import "util/rotate.glsl"
#import "util/rotateAxis.glsl"
#import "util/avgFrequency.glsl"

// uniforms
uniform vec4 iMods;
uniform sampler2D texture;
uniform sampler2D music;
uniform sampler2D freq;

vec3 lightPos = vec3(0,0,0);
vec3 fogColor = vec3(0,0,0);

int hit_ = 0;
float id_ = 0.;
float intensity_ = 0.;

const float gridDist = 0.35;
const float maxfreq = 16000.0;
const float freqstep = 400.;

float getDist(vec3 point){
	
	float w = gridDist * (maxfreq/freqstep) * 0.5;
	vec3 p = point;
	p.x += w;
	p.y -= 0.5;	
	id_ = floor(p.x/gridDist-0.5);
	float local = fract(p.x);
			
	if(point.x > -w && point.x < w+gridDist*0.5){
		p.x = mod(p.x + gridDist/2.0, gridDist) - gridDist/2.0;
	}
	if(p.y > 0.0 && p.y < gridDist * 7.5) p.y = mod(p.y + gridDist/2.0, gridDist) - gridDist/2.0;
	
	intensity_ = avgFrequency(music, id_*freqstep, id_*freqstep+freqstep);
	float bh = clamp(log(intensity_+1.)*0.35, 0.05, 0.15);
	float bd = sdBox(p, vec3(vec3(bh)));
	bd = mix(bd, sdSphere(p, bh), 0.5-intensity_*0.5)-0.001;
	float fd = point.y;
	
	if(bd < fd){
		hit_ = 1;
		return bd;
	}
	hit_ = 2;
	return fd;
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
	float totIntensity = avgFrequency(music, 4000., 16000.);
	vec3 rayOrigin = iCamPos;
	vec2 coords = vec2(iCoords.x*iResolution.z, iCoords.y);
	vec3 rayDir = iCamRot * normalize(vec3(coords.x, coords.y, -1.0));
	lightPos = vec3(0.0,10,2.0+totIntensity*(1.+totIntensity)*10.0);
	float distance = doRaymarch(rayOrigin, rayDir);
	int hit = hit_;
	float id = id_;
	float intensity = intensity_;
	vec3 point = rayOrigin + rayDir * distance;
	float light = getLight(point);
	
	vec4 rgba;
	rgba = vec4(1.0, 1.0, 1.0, 1.0);
	if(hit == 1){
		// box
		float hue = 0.3 - intensity * 0.3;
		rgba.xyz = hsl2rgb(vec3(hue, 1.0, 0.5));
	/*	rgba.x *= avgFrequency(music, 0.0, 5000.0);	
		rgba.y *= avgFrequency(music, 5000.0, 10000.0);	
		rgba.z *= avgFrequency(music, 10000.0, 15000.0); */
	} else if(hit == 2){
		// floor
		vec2 texCoords;
		texCoords.x = mod(abs(point.x)*0.1,1.0);
		texCoords.y = mod(abs(point.z)*0.1,1.0);
		rgba = texture2D(texture, texCoords);
		rgba.xyz *= vec3(3.0);
		rgba.x *= avgFrequency(music, 0.0, 5000.0);	
		rgba.y *= avgFrequency(music, 5000.0, 10000.0);	
		rgba.z *= avgFrequency(music, 10000.0, 15000.0);	
	} 
		
	fogColor = hsl2rgb(vec3(clamp(0.3-((totIntensity-0.1)*3.0)*0.3, 0.0, 1.0), 1.0, min(totIntensity, 0.75)));
	
	light *= min(totIntensity*10.0, 1.0);
	
	rgba.xyz = rgba.xyz * light;
	rgba.xyz = applyFog(rgba.xyz, distance);
		
	// sky
	
	gl_FragColor = rgba;
	
	// audio display
	vec2 screenCoords = vec2(iCoords.x+0.5, -iCoords.y+0.5);
	
	// music display
	if(screenCoords.y > 0.8 && screenCoords.y < 0.9){
		vec4 c = texture2D(freq, vec2(screenCoords.x/iAudio.x*20000., 0.5));
		if(c.x > 0.1) gl_FragColor = c;		
	}
	
	// frequency test display
	if(screenCoords.y > 0.9){
		vec4 c = texture2D(music, vec2(screenCoords.x/iAudio.x*maxfreq, 0.5));
		gl_FragColor = c;
	}
	
}
