function ShaderProgram(){
	this.attributes = {};
	this.uniforms = {};
	this.textureChannels = {};
	this.program;
}
ShaderProgram.texturesCount = 0;
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
ShaderProgram.prototype.addTexture = function(name, texturePath){
	var resourceName = name;
	Resources.addTexture(resourceName, texturePath);
	this.textureChannels[name] = {
		resourceName: resourceName,
		name: name,
		index: ShaderProgram.texturesCount++,
		location: gl.getUniformLocation(this.program, name),
		texturePath: texturePath,
		texture: null,
	};
}
ShaderProgram.prototype.use = function(){
	gl.useProgram(this.program);
}
ShaderProgram.prototype.applyAttributes = function(){}
ShaderProgram.prototype.applyUniforms = function(){}

function ShaderBindings(){}
ShaderBindings.onInit = function(shader){};
ShaderBindings.onUpdate = function(shader){};
ShaderBindings.onRender = function(shader){};
