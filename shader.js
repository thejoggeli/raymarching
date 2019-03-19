function ShaderProgram(){
	this.attributes = {};
	this.uniforms = {};
	this.channels = {};
	this.program;
}
ShaderProgram.channelIndex = 0;
ShaderProgram.prototype.create = function(vsrc, fsrc){
	// shaders
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, vsrc);
	gl.compileShader(vertexShader);
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, fsrc);
	gl.compileShader(fragmentShader);
	this.program = gl.createProgram();
	gl.attachShader(this.program, vertexShader);
	gl.attachShader(this.program, fragmentShader);
	gl.linkProgram(this.program);
	gl.useProgram(this.program);
	
	if(!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
		var linkErrLog = gl.getProgramInfoLog(this.program);
		console.log("Shader this.program did not link successfully. " + "Error log: " + linkErrLog);
		var compilationLog = gl.getShaderInfoLog(vertexShader);
		if(compilationLog != "") console.log(compilationLog);
		compilationLog = gl.getShaderInfoLog(fragmentShader);
		if(compilationLog != "") console.log(compilationLog);
		return;
	}
}
ShaderProgram.prototype.addAttribute = function(name){
	this.attributes[name] = {
		name: name,
		location: gl.getAttribLocation(this.program, name),
	};
	console.log("attribute", this.attributes[name]);
}
ShaderProgram.prototype.addUniform = function(name){
	this.uniforms[name] = {
		name: name,
		location: gl.getUniformLocation(this.program, name),
	};	
	console.log("uniform", this.uniforms[name]);
}
ShaderProgram.prototype.addChannel = function(name, resource){	
	this.channels[name] = {
		name: name,
		location: gl.getUniformLocation(this.program, name),
		index: ShaderProgram.channelIndex++,
		resource: null,
	};
	if(resource !== undefined && resource !== null){
		this.setChannel(name, resource);
	}
}
ShaderProgram.prototype.setChannel = function(name, resource){
	var channel = this.channels[name];
	if(channel.resource !== null && channel.resource.type == "audio"){
		channel.resource.stop();
	}
	channel.resource = resource;
	if(resource.type == "audio"){
		if(resource.htmlAudio.autoplay){
			resource.play();
		}
	}
}
ShaderProgram.prototype.use = function(){
	gl.useProgram(this.program);
}

ShaderProgram.prototype.render = function(){	
	this.use();
	// uniform time
	gl.uniform1f(this.uniforms.iTime.location, Time.sinceStart);
	// uniform texutre
	var textureSize = work.vec3[0];
	textureSize[0] = bufferTextureWidth;
	textureSize[1] = bufferTextureHeight;
	textureSize[2] = bufferTextureWidth / bufferTextureHeight;	
	gl.uniform3fv(this.uniforms.iResolution.location, textureSize);
	// uniform window
	var windowSize = work.vec3[0];
	windowSize[0] = window.innerWidth;
	windowSize[1] = window.innerHeight;
	windowSize[2] = window.innerWidth / window.innerHeight;
	gl.uniform3fv(this.uniforms.iWindow.location, windowSize);
	// uniform mods
	gl.uniform4fv(this.uniforms.iMods.location, mods);
	// uniform camera_position
	var cameraPosition = work.vec3[0];
//	glMatrix.vec3.set(cameraPosition, 0, 1, 0);
	glMatrix.vec3.copy(cameraPosition, Camera3d.position);
	gl.uniform3fv(this.uniforms.iCamPos.location, cameraPosition);
	// uniform camera_rotation
//	var cameraRotationQuat = work.quat[0];
//	glMatrix.quat.identity(cameraRotationQuat);
//	glMatrix.quat.rotateY(cameraRotationQuat, cameraRotationQuat, Math.sin(Time.sinceStart)*0.75);
//	glMatrix.quat.rotateX(cameraRotationQuat, cameraRotationQuat, Math.sin(Time.sinceStart*2.0)*0.2);
	var cameraRotationMatrix = work.mat3[0];
//	glMatrix.mat3.fromQuat(cameraRotationMatrix, cameraRotationQuat);
	glMatrix.mat3.fromQuat(cameraRotationMatrix, Camera3d.rotation);
	gl.uniformMatrix3fv(this.uniforms.iCamRot.location, false, cameraRotationMatrix);
	// uniform audio
	var audio = work.vec4[0];
	audio[0] = Audios.maxFrequency;
	audio[1] = Audios.sampleRate;
	audio[2] = Audios.sampleStep;
	audio[3] = Audios.numSamples;
	gl.uniform4fv(this.uniforms.iAudio.location, audio);
	// attribute a_pos
	gl.bindBuffer(gl.ARRAY_BUFFER, plane.vertex_vbo);
	gl.vertexAttribPointer(this.attributes.a_pos.location, 3, gl.FLOAT, false, 0, 0); 
	gl.enableVertexAttribArray(this.attributes.a_pos.location);	
	// attribute a_uv
	gl.bindBuffer(gl.ARRAY_BUFFER, plane.uv_vbo);
	gl.vertexAttribPointer(this.attributes.a_uv.location, 2, gl.FLOAT, false, 0, 0); 
	gl.enableVertexAttribArray(this.attributes.a_uv.location);
	
	// channels
	for(var c in this.channels){
		var channel = this.channels[c];
		if(channel.resource === null) continue;
		var unit = channel.index+1;
		gl.activeTexture(gl["TEXTURE"+unit]);
		gl.bindTexture(gl.TEXTURE_2D, channel.resource.location);
		channel.resource.updateTexture();
		gl.uniform1i(channel.location, unit);
	}
	
	// draw
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);		
}


function James(){}
James.enableCameraMovement = true;
James.cameraMovementSpeed = 20.0;
James.onInit = function(shader){};
James.onStart = function(shader){};
James.onUpdate = function(shader){};
James.onLateUpdate = function(shader){};
James.start = function(shader){
	James.onStart(shader);
}
James.init = function(shader){
	James.onInit(shader);
}
James.update = function(shader){
	James.onUpdate(shader);
	if(James.enableCameraMovement){
		// move camera
		var dir = work.vec3[0];
		var moveSpeed = James.cameraMovementSpeed;
		glMatrix.vec3.zero(dir);
		if(Input.isKeyDown(87)){
			dir[2] = -1;
		} else if(Input.isKeyDown(83)){
			dir[2] = 1;
		} 
		if(Input.isKeyDown(65)){
			dir[0] = -1;
		} else if(Input.isKeyDown(68)){
			dir[0] = 1;
		}
		if(Input.isKeyDown(84)){
			Camera3d.position[1] += moveSpeed * Time.deltaTime;
		} else if(Input.isKeyDown(71)){
			Camera3d.position[1] -= moveSpeed * Time.deltaTime;
		}
		if(glMatrix.vec3.length(dir) != 0){
			glMatrix.vec3.transformQuat(dir, dir, Camera3d.rotation);
			dir[1] = 0;
			glMatrix.vec3.normalize(dir, dir);
			glMatrix.vec3.scaleAndAdd(Camera3d.position, Camera3d.position, dir, Time.deltaTime*moveSpeed);			
		}
		// rotate camera
		var rotationSpeed = 90;
		if(Input.isKeyDown(81)){
			Camera3d.rotateEulers(0, rotationSpeed * Time.deltaTime, 0);
		} else if(Input.isKeyDown(69)){
			Camera3d.rotateEulers(0, -rotationSpeed * Time.deltaTime, 0);
		}
		if(Input.isKeyDown(82)){
			Camera3d.rotateEulers(rotationSpeed * Time.deltaTime, 0, 0);
		} else if(Input.isKeyDown(70)){
			Camera3d.rotateEulers(-rotationSpeed * Time.deltaTime, 0, 0);
		}		
	}
	James.onLateUpdate(shader);
};


