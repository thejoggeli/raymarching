float atan360(float y, float x){
	return mod(atan(y,x)+3.14159*2.0, 3.14159*2.0);
}