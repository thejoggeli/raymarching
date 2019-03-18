mat3 rotateAxis(float angle, vec3 axis){
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);    
	float u = axis.x;
	float v = axis.y;
	float w = axis.z;
	float u2 = u*u;
	float v2 = v*v;
	float w2 = w*w;
    return mat3(
		// c1
		u2+(1.0-u2)*c,
		u*v*(1.0-c)-w*s,
		u*w*(1.0-c)+v*s,
		// c2
		u*v*(1.0-c)+w*s,
		v2+(1.0-v2)*c,
		v*w*(1.0-c)-u*s,
		// c3
		u*w*(1.0-c)-v*s,
		v*w*(1.0-c)+u*s,
		w2+(1.0-w2)*c
	);
}