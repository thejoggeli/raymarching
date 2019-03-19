float avgFrequency(in sampler2D tex, float low, float high){
	const float numSteps = 24.0;
	float sum = 0.0;
	float offset = low/iAudio.x;
	float step = (high-low)/numSteps/iAudio.x;
	for(float i = 0.0; i < numSteps; i++){
		sum += texture2D(tex, vec2(offset+i*step, 0.5)).x;
	}
	return sum / numSteps;
}
