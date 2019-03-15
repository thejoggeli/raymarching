attribute vec3 a_pos;
attribute vec2 a_uv;
varying vec2 uv;
void main() {
	gl_Position = vec4(a_pos, 1.0);
	uv = a_uv;
}
