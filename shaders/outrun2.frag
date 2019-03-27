#import "util/sdSphere.glsl"
#import "util/sdBox.glsl"
#import "util/rotate.glsl"
#import "util/avgFrequency.glsl"
#import "util/hsl2rgb.glsl"
#import "util/smin.glsl"

#define MAX_STEPS 100
#define MAX_DIST 250.0
#define SURF_DIST 0.001

vec3 lightPos = vec3(0, 5, 0);
vec3 fogColor = vec3(0, 0, 0);

uniform sampler2D music;

float musicIntensity[2];

const float gridDist = 1.0;
const float moveSpeed = 10.0;
const float waveSpeed = 2.5;
const float edgeWidth = 0.01;
const vec3 sunPosition = vec3(0.0, 20.0, -80.0);
float sunRadius = 15.0;
float s1, s2, s3;

int getColorId(vec3 point){
	vec3 p;
	p = point - vec3(0.0, 0.0, moveSpeed*iTime);
//	p.x = floor(point.x*gridDist)/gridDist;
//	p.z = floor(point.z*gridDist)/gridDist;
	float fd = 
		p.y
		+ sin(mod(iTime*1.12312*waveSpeed+p.x*0.84323, 3.141*2.0)) * 0.2123 * s2
		+ sin(mod(iTime*0.84733+p.z*0.84323, 3.141*2.0)) * 0.3435 * s2;
	// sun
	p = point - sunPosition;
//	p.z -= sin(p.y*2.0+iTime)*2.0;
	float sd = sdSphere(p, sunRadius);
	// mountains
	p = point - vec3(0.0, 0.0, sunPosition.z+sunRadius);
	p.y += sin(point.x*0.1) * 2.0;
	float md = sdBox(p, vec3(100000.0, sunPosition.y*0.6, 0.1));
	
	float m = min(md, min(fd, sd));	
	if(m == fd) return 0;
	if(m == sd) return 1;
	if(m == md) return 2;
}
float getDist(vec3 point){
	vec3 p;
	p = point - vec3(0.0, 0.0, moveSpeed*iTime);
//	p.x = floor(point.x*gridDist)/gridDist;
//	p.z = floor(point.z*gridDist)/gridDist;
	float fd = 
		p.y
		+ sin(mod(iTime*1.12312*waveSpeed+p.x*0.84323, 3.141*2.0)) * 0.2123 * s2
		+ sin(mod(iTime*0.84733+p.z*0.84323, 3.141*2.0)) * 0.3435 * s2;
	// sun
	p = point - sunPosition;
//	p.z -= sin(p.y*2.0+iTime)*2.0;
	float sd = sdSphere(p, sunRadius);
	// mountains
	p = point - vec3(0.0, 0.0, sunPosition.z+sunRadius);
	p.y += sin(point.x*0.1) * 2.0;
	float md = sdBox(p, vec3(100000.0, sunPosition.y*0.6, 0.1));
	return min(md, min(sd, fd));
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
float getMinDistance(vec3 rayOrigin, vec3 rayDir){
	float d_marched = 0.0;
	float min = 100000.0;
	for(int i = 0; i < MAX_STEPS; i++){
		vec3 point = rayOrigin + rayDir * d_marched;
		float d_step = getDist(point);
		d_marched += d_step;
		if(d_step < min){
			min = d_step;
		}
		if(d_marched > MAX_DIST || d_step < SURF_DIST){
			break;
		}
	}
	return min;
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
bool getEdge(vec3 p, float  distance){
//	p.z -= iTime * moveSpeed;
	float edge = edgeWidth * distance;
	vec3 m = abs(vec3(gridDist) - mod(abs(p), gridDist));
	return m.x < edge || m.z < edge || abs(p.x) < edge*0.5 || abs(p.z) < edge*0.5;
}
vec3 applyFog(in vec3  rgb, in float distance){
	float fogAmount = clamp(1.0 - exp((-distance+120.0)*0.025), 0.0, 1.0);
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
	
	musicIntensity[0] = avgFrequency(music, 0.0, 16000.0);
	musicIntensity[1] = avgFrequency(music, 0.0, 16000.0);	
	
	s1 = musicIntensity[1] * 2.0;
	s2 = 1.0; // clamp(exp(musicIntensity[0]*2.0)-1.0, 0.25, 1.0);
//	s3 = clamp(exp(musicIntensity[0] * 3.0)-1.0, 0.0, 1.0);
	s3 = musicIntensity[0]*2.0;
	
	sunRadius = sunRadius + s3 * sunRadius;
	
	vec2 coords = vec2(iCoords.x*iResolution.z, iCoords.y);
	vec3 rayOri = iCamPos;
	vec3 rayDir = iCamRot * normalize(vec3(coords.x, coords.y, -1.0));
	
	rayDir.xz = rotate(sin(iTime*1.1343)*0.15123) * rayDir.xz; // y-axis (yaw)
	rayDir.yz = rotate(sin(iTime*1.3234)*0.13831) * rayDir.yz; // x-axis (pitch)
	rayDir.xy = rotate(sin(iTime*1.7423)*0.14233) * rayDir.xy; // z-axis (roll)
		
//	lightPos = vec3(10,10,0);
//	lightPos.xz = rotate(iTime) * lightPos.xz;
	lightPos = vec3(0,10,0);
	
	float distanceMarched = doRaymarch(rayOri, rayDir);
	vec3 point = rayOri + rayDir * distanceMarched;
	
	vec3 color = vec3(0.0, 0.0, 0.1);
			
	vec3 colorPoint = point;
	vec3 colorDir = rayDir;
	
	bool sky = false;
	
	if(distanceMarched < MAX_DIST){
		for(int i = 0; i < 50; i++){
			int colorId = getColorId(colorPoint);
			if(colorId == 0){
				// water grid
				bool edge = getEdge(colorPoint, distanceMarched);
				if(edge && i == 0){
					color = vec3(0,1,1);
					break;
				} else if(edge && i > 0){
					color = vec3(0.0, 0.0, 0.2);
					break;
				}
				vec3 normal = getNormal(colorPoint);
				vec3 reflection = colorDir - 2.0 * dot(colorDir, normal) * normal;
				colorPoint += reflection*SURF_DIST*2.0;
				float dist = doRaymarch(colorPoint, reflection);
				colorPoint = colorPoint + reflection * dist;
				colorDir = reflection;
			} else if(colorId == 1){
			/*	float py = point.y;
				float y = mod(1.0/(py*py*0.01)+0.1, 1.0);
				if(point.y < sunPosition.y && y > 0.8) {
					sky = true;
					break;
				} */
				// sun
				float red = 1.0;
				float green = (sin(point.y*0.2-iTime)*0.5+0.5)*0.7+0.3;
				color = vec3(red, green, 0.0);
				break;
			} else if(colorId == 2){
				color = vec3(0.0);
				break;
			} else {
				break;
			}
		}
	} else {
		sky = true;
	}

	if(sky){
		float minDistance = getMinDistance(rayOri, rayDir);
		float glow = clamp(2.0-exp(minDistance*0.5), 0.0, 1.0);
		float gradient = clamp(coords.y, 0.0, 1.0);
		color = gradient*vec3(0,0,1) + glow * vec3(1,1,1) + vec3(1,0,1)*s1;
	}
	
	gl_FragColor = vec4(color, 1.0);
	
	// frequency test display
	vec2 screenCoords = vec2(iCoords.x+0.5, -iCoords.y+0.5);
	if(screenCoords.y > 0.9){
		vec4 c = texture2D(music, vec2(screenCoords.x/iAudio.x*16000.0, 0.5));
		gl_FragColor = c;
	}
	
}
