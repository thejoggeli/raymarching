ShaderBindings.onInit = function(shader){
	shader.addTexture("iTexture0", "noise-1.jpg");
	glMatrix.vec3.set(Camera3d.position, 0, 1.7, 0);
}