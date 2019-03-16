var plane = {
	vertices: [
		-1.0, -1.0, 0,
		1.0, -1.0, 0,
		-1.0, 1.0, 0,
		1.0, 1.0, 0,
	],
	uvs: [
		-0.5, -0.5, 
		0.5, -0.5,
		-0.5, 0.5,
		0.5, 0.5,
	],
	texcoords: [
		0, 0,
		1, 0,
		0, 1,
		1, 1,
	],
	vertex_vbo: null,
	uv_vbo: null,
	texcoords_vbo: null,
}

var work = {
	mat4: [],
	mat3: [],
	vec4: [],
	vec3: [],
	vec2: [],
	quat: [],
}

var shader;
var textureShader;

var textureWidth, textureHeight;
var textureScaleExponent = 0;
var textureScale = 1;
var texture = null;
var framebuffer = null;

var mods = glMatrix.vec4.create();

$(document).ready(function(){
	Monitor.setup({showTitle: false});
	// setup Gfw 
	Gfw.setup({scaling:false});
	Gfw.createCanvas("main", {"renderMode": RenderMode.Canvas3d});
	Gfw.getCanvas("main").setActive();
	Gfw.onUpdate = onUpdate;
	Gfw.onRender = onRender;
	Gfw.onResize = onResize;
	// init
	init();
	// start
	Gfw.setBackgroundColor("#008");
	Gfw.start();
	
	Gfw.inputOverlay.off("touchstart");
	Gfw.inputOverlay.off("touchmove");
	Gfw.inputOverlay.off("touchend");
	
	Toast.info("Welcome to the Raymarcher", 3);	
});

function init(){
	// vertex buffer
	plane.vertex_vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, plane.vertex_vbo);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(plane.vertices), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	// uv buffer
	plane.uv_vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, plane.uv_vbo);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(plane.uvs), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	// texcoords buffer
	plane.texcoords_vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, plane.texcoords_vbo);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(plane.texcoords), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	
	// shader
	console.log("raymarching shader");
	shader = new ShaderProgram();
	shader.create(
		document.querySelector("#vertex-shader-raymarching").innerHTML, 
		document.querySelector("#fragment-shader-raymarching").innerHTML
	);
	shader.addAttribute("a_pos");
	shader.addAttribute("a_uv");
	shader.addUniform("iWindow");
	shader.addUniform("iRect");
	shader.addUniform("iTime");
	shader.addUniform("iCamPos");
	shader.addUniform("iCamRot");
	shader.addUniform("iMods");
	shader.use();
	
	// texture shader
	console.log("texture shader");
	textureShader = new ShaderProgram();
	textureShader.create(
		document.querySelector("#vertex-shader-texture").innerHTML, 
		document.querySelector("#fragment-shader-texture").innerHTML
	);
	textureShader.addAttribute("a_pos");
	textureShader.addAttribute("a_uv");
	textureShader.addUniform("sampler");
	
	for(var i = 0; i < 10; i++){
		work.mat4[i] = glMatrix.mat4.create();
		work.mat3[i] = glMatrix.mat3.create();
		work.vec4[i] = glMatrix.vec4.create();
		work.vec3[i] = glMatrix.vec3.create();
		work.vec2[i] = glMatrix.vec2.create();
		work.quat[i] = glMatrix.quat.create();
	}
	glMatrix.vec4.set(mods, 1, 1, 1, 1);
	
	// init camrea
	Camera3d.init();
	glMatrix.vec3.set(Camera3d.position, 0, 1.7, 10);
	
}

function generateTexture(){	
	if(texture !== null){
		gl.deleteTexture(texture);
	}
	texture = gl.createTexture();
	textureWidth = window.innerWidth * textureScale;
	textureHeight = window.innerHeight * textureScale;
	const level = 0;
	const internalFormat = gl.RGB;
	const border = 0;
	const format = gl.RGB;
	const type = gl.UNSIGNED_BYTE;
	const data = null;	
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
		textureWidth, textureHeight, border,	
		format, type, data
	);
//	gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAX_ANISOTROPY_EXT, 0);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	// Prevents s-coordinate wrapping (repeating).
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	// Prevents t-coordinate wrapping (repeating).
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	if(framebuffer !== null){
		gl.deleteFramebuffer(framebuffer);
	}
	// Create and bind the framebuffer
	framebuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
	// attach the texture as the first color attachment
	const attachmentPoint = gl.COLOR_ATTACHMENT0;
	gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, texture, level);
}

function setTextureScale(expo){
	textureScaleExponent = expo;
	textureScale = Math.pow(2,expo);
	generateTexture();
}

function onResize(){
	generateTexture();
}

function onUpdate(){
	if(Input.isKeyDown(37)){
		mods[0] = mods[0] - Time.deltaTime;
	} else if(Input.isKeyDown(39)){
		mods[0] = mods[0] + Time.deltaTime;		
	}
	if(Input.keyDown(49)){
		setTextureScale(textureScaleExponent-1);
	} else if(Input.keyDown(50)){
		var scale = textureScaleExponent+1;
		if(scale > 0) scale = 0;
		setTextureScale(scale);
	}
	// move camera
	var moveSpeed = 10;
	var dir = work.vec3[0];
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
	// update camera transform
	Camera3d.updateTransform();
	// monitor stuffs
	Monitor.set("FPS", Time.fps);
	Monitor.set("tex size", textureWidth + "x" + textureHeight);
	Monitor.set("tex scale", roundToFixed(textureScale, 3) + " (2^" + textureScaleExponent + ")");
	Monitor.set("pos-x", roundToFixed(Camera3d.position[0], 3));
	Monitor.set("pos-y", roundToFixed(Camera3d.position[1], 3));
	Monitor.set("pos-z", roundToFixed(Camera3d.position[2], 3));
	Monitor.set("rot-x", roundToFixed(Camera3d.eulers[0], 3));
	Monitor.set("rot-y", roundToFixed(Camera3d.eulers[1], 3));
	Monitor.set("rot-z", roundToFixed(Camera3d.eulers[2], 3));
}

function onRender(){
	// render to texture
	shader.use();
	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
	gl.viewport(0, 0, textureWidth, textureHeight);
	gl.clear(gl.COLOR_BUFFER_BIT);	
	// uniform time
	gl.uniform1f(shader.uniforms.iTime.location, Time.sinceStart);
	// uniform texutre
	var textureSize = work.vec3[0];
	textureSize[0] = textureWidth;
	textureSize[1] = textureHeight;
	textureSize[2] = textureWidth / textureHeight;	
	gl.uniform3fv(shader.uniforms.iRect.location, textureSize);
	// uniform window
	var windowSize = work.vec3[0];
	windowSize[0] = window.innerWidth;
	windowSize[1] = window.innerHeight;
	windowSize[2] = window.innerWidth / window.innerHeight;
	gl.uniform3fv(shader.uniforms.iWindow.location, windowSize);
	// uniform mods
	gl.uniform4fv(shader.uniforms.iMods.location, mods);
	// uniform camera_position
	var cameraPosition = work.vec3[0];
//	glMatrix.vec3.set(cameraPosition, 0, 1, 0);
	glMatrix.vec3.copy(cameraPosition, Camera3d.position);
	gl.uniform3fv(shader.uniforms.iCamPos.location, cameraPosition);
	// uniform camera_rotation
//	var cameraRotationQuat = work.quat[0];
//	glMatrix.quat.identity(cameraRotationQuat);
//	glMatrix.quat.rotateY(cameraRotationQuat, cameraRotationQuat, Math.sin(Time.sinceStart)*0.75);
//	glMatrix.quat.rotateX(cameraRotationQuat, cameraRotationQuat, Math.sin(Time.sinceStart*2.0)*0.2);
	var cameraRotationMatrix = work.mat3[0];
//	glMatrix.mat3.fromQuat(cameraRotationMatrix, cameraRotationQuat);
	glMatrix.mat3.fromQuat(cameraRotationMatrix, Camera3d.rotation);
	gl.uniformMatrix3fv(shader.uniforms.iCamRot.location, false, cameraRotationMatrix);
	// attribute a_pos
	gl.bindBuffer(gl.ARRAY_BUFFER, plane.vertex_vbo);
	gl.vertexAttribPointer(shader.attributes.a_pos.location, 3, gl.FLOAT, false, 0, 0); 
	gl.enableVertexAttribArray(shader.attributes.a_pos.location);	
	// attribute a_uv
	gl.bindBuffer(gl.ARRAY_BUFFER, plane.uv_vbo);
	gl.vertexAttribPointer(shader.attributes.a_uv.location, 2, gl.FLOAT, false, 0, 0); 
	gl.enableVertexAttribArray(shader.attributes.a_uv.location);
	// draw
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);	
	
	// texture to screen
	textureShader.use();
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.viewport(0, 0, window.innerWidth, window.innerHeight);
	// attribute a_pos
	gl.bindBuffer(gl.ARRAY_BUFFER, plane.vertex_vbo);
	gl.vertexAttribPointer(textureShader.attributes.a_pos.location, 3, gl.FLOAT, false, 0, 0); 
	gl.enableVertexAttribArray(textureShader.attributes.a_pos.location);	
	// attribute a_uv
	gl.bindBuffer(gl.ARRAY_BUFFER, plane.texcoords_vbo);
	gl.vertexAttribPointer(textureShader.attributes.a_uv.location, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(textureShader.attributes.a_uv.location);
	// active texture
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.uniform1i(textureShader.uniforms.sampler.location, 0);
	// draw
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

function Camera3d(){}
Camera3d.aspect = 0;
Camera3d.inverseTransform;
Camera3d.transform;
Camera3d.position;
Camera3d.rotation;
Camera3d.scale;
Camera3d.eulers;
Camera3d.eulersFlag = true;
Camera3d.init = function(){
	Camera3d.transform = glMatrix.mat4.create();
	Camera3d.inverseTransform = glMatrix.mat4.create();
	Camera3d.position = glMatrix.vec3.create();
	Camera3d.rotation = glMatrix.quat.create();
	Camera3d.scale = glMatrix.vec3.create();
	glMatrix.vec3.set(Camera3d.scale, 1, 1, 1);
	Camera3d.eulers = glMatrix.vec3.create();
}
Camera3d.updateTransform = function(){
	if(Camera3d.eulersFlag){
		glMatrix.quat.fromEuler(Camera3d.rotation, Camera3d.eulers[0], Camera3d.eulers[1], Camera3d.eulers[2]);	
		Camera3d.eulersFlag = false;	
	}
	// transform
	glMatrix.mat4.fromRotationTranslationScale(Camera3d.transform, Camera3d.rotation, Camera3d.position, Camera3d.scale);
	// inverse
	glMatrix.mat4.invert(Camera3d.inverseTransform, Camera3d.transform);	
}
Camera3d.setEulers = function(){
	glMatrix.vec3.set(Camera3d.eulers, x, y, z);
	Camera3d.setEulersFlag();
}
Camera3d.rotateEulers = function(x, y, z){
	Camera3d.eulers[0] += x;
	Camera3d.eulers[1] += y;
	Camera3d.eulers[2] += z;
	Camera3d.setEulersFlag();
}
Camera3d.setEulersFlag = function(){
	Camera3d.eulersFlag = true;
}


































