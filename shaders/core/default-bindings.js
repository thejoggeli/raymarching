ShaderBindings.onInit = function(shader){
	
}
ShaderBindings.onUpdate = function(shader){
	ShaderBindings.simpleCameraMovement(10);
}
ShaderBindings.onRender = function(shader){
	
}
ShaderBindings.simpleCameraMovement = function(moveSpeed){	
	// move camera
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
}