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
	this.channels[name].resource = resource;
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
	
	// shader bindings
	ShaderBindings.onRender(shader);
	// draw
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);		
}


function ShaderBindings(){}
ShaderBindings.onInit = function(shader){};
ShaderBindings.onStart = function(shader){};
ShaderBindings.onUpdate = function(shader){};
ShaderBindings.onRender = function(shader){};


