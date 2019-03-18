mat2 rotate(float angle){
	float c = cos(angle);
	float s = sin(angle);
	return mat2(c,s,-s,c);
}