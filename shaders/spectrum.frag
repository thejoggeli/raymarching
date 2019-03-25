
uniform sampler2D texture;
uniform sampler2D music;

float maxFrequency = 16000.0;

float getHeight(vec2 point){
	return 0.0;
}

bool isBelow(vec3 point){
	return point.y < 0.0;
}

float doMarch(vec3 rayOri, vec3 rayDir){
	float dt = 0.01f;
	const float mint = 0.001f;
	const float maxt = 200.0f;
	const float lasth = 0.0f;
	const float lasty = 0.0f;
	for(float t = 0; t < maxt; t += dt){
		vec3 point = rayOri + rayDir * distanceMarched;
		float h = f(point.xz);
		if(point.y < h){
			return mix(distanceMarched, distanceMarchedPrev, 0.5);
		}
		distanceMarched = max(distanceMarched, 0.01) + distanceMarched;
	}
	return distanceMarched;
}



void main() {
	
	vec2 coords = vec2(iCoords.x*iResolution.z, iCoords.y);
	vec3 rayOri = iCamPos;
	vec3 rayDir = iCamRot * normalize(vec3(coords.x, coords.y, -1.0));
	
	float distanceMarched = doMarch(rayOri, rayDir);
	vec3 point = rayOri + rayDir * distanceMarched;
			
	gl_FragColor = distanceMarched >= MAX_DIST ? vec4(0,0,0,1) : vec4(0,1,1,1);
	
	// audio display
	vec2 screenCoords = vec2(iCoords.x+0.5, -iCoords.y+0.5);	
	if(screenCoords.y > 0.9){
		vec4 c = texture2D(music, vec2(screenCoords.x/iAudio.x*maxFrequency, 0.5));
		gl_FragColor = c;
	}
	
}
