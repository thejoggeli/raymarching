function Textures(){}
Textures.textures = {};
Textures.imagesCount = 0;
Textures.imagesLoadedCount = 0;
Textures.add = function(name, path){
	Textures.imagesCount++;
	var htmlImage = new Image();
	htmlImage.src = "resources/" + path;
	htmlImage.name_ = name;	
	var texture = Textures.textures[name] = new ShaderTexture();
	texture.name = name;
	texture.path = path;
	texture.htmlImage = htmlImage;
	texture.location = gl.createTexture();
	return texture;
}
Textures.load = function(callback){
	if(Textures.imagesCount == 0) return callback();
	for(var i in Textures.textures){
		var texture = Textures.textures[i];
		texture.htmlImage.container_ = texture;
		texture.htmlImage.onload = function(){
			if(this.loaded_) return;
			this.loaded_ = true;
			this.container_.init();
			console.log(this.src);
			Textures.imagesLoadedCount++;
			if(Textures.imagesLoadedCount >= Textures.imagesCount){
				callback();
			}
		}
	}
}
Textures.get = function(name){
	return Textures.textures[name];
}

function ShaderTexture(){
	this.type = "texture";
}
ShaderTexture.prototype.init = function(){
	var textureWidth = this.htmlImage.width;
	var textureHeight = this.htmlImage.height;
	var level = 0;
	var internalFormat = gl.RGBA;
	var border = 0;
	var format = gl.RGBA;
	var type = gl.UNSIGNED_BYTE;
	gl.bindTexture(gl.TEXTURE_2D, this.location);
	gl.texImage2D(
		gl.TEXTURE_2D, level, internalFormat,
		format, type,
		this.htmlImage
	);	
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);	
	this.width = textureWidth;
	this.height = textureHeight;	
}
ShaderTexture.prototype.updateTexture = function(){}
