ShaderBindings.onInit = function(shader){
	
	glMatrix.vec3.set(Camera3d.position, 0, 1.7, 0);

	// texture
	var texture = Textures.add("texture", "noise-1.jpg");
	shader.addChannel("iTexture", texture);	
	
	// music
	var music = Audios.add("music", "music/BRD-Teleport-Prokg.mp3");
	shader.addChannel("iMusic", music);
	
	// music
	var freq = Audios.add("freq", "music/frequency-test.mp3");
	shader.addChannel("iFreq", freq);
	
}
