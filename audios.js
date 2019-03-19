function Audios(){}
Audios.audios = {};
Audios.numAudios = 0;
Audios.numAudiosLoaded = 0;
Audios.add = function(name, path){
	Audios.numAudios++;
	var htmlAudio = new Audio();
	htmlAudio.src = "resources/" + path;
	htmlAudio.loop = true;
	var audio = new ShaderAudio();
	audio.name = name;
	audio.path = path;
	audio.htmlAudio = htmlAudio;
	audio.location = gl.createTexture();
	Audios.audios[name] = audio;
	return audio;
}
Audios.get = function(name){
	return Audios.audios[name];
}
Audios.load = function(callback){
	if(Audios.numAudios == 0) return callback();
	for(var a in Audios.audios){
		var audio = Audios.audios[a];
		audio.htmlAudio.container_ = audio;
		audio.htmlAudio.loop = true;
		audio.htmlAudio.autoplay = true;
		audio.htmlAudio.oncanplaythrough = function(){
			if(this.loaded_) return;
			this.loaded_ = true;
			this.container_.init();
			console.log(this.src);
			Audios.numAudiosLoaded++
			if(Audios.numAudiosLoaded >= Audios.numAudios){
				callback(); // console.log("ready");
			}		
		}
	}
}

function ShaderAudio(){
	this.type = "audio";
}
ShaderAudio.prototype.init = function(){
	this.context = new AudioContext();
	this.audioSource = this.context.createMediaElementSource(this.htmlAudio);
	this.analyser = this.context.createAnalyser();
	this.numSamples = this.analyser.frequencyBinCount;
	this.audioData = new Uint8Array(this.numSamples);	
	this.audioSource.connect(this.analyser);
	this.analyser.connect(this.context.destination);	
	gl.bindTexture(gl.TEXTURE_2D, this.location);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);	
}
ShaderAudio.prototype.play = function(){
	this.htmlAudio.play();
}
ShaderAudio.prototype.updateTexture = function(){
	this.analyser.getByteFrequencyData(this.audioData);
	gl.texImage2D(
		gl.TEXTURE_2D, 0, gl.LUMINANCE, this.numSamples, 1, 0,
		gl.LUMINANCE, gl.UNSIGNED_BYTE, this.audioData
	);
}