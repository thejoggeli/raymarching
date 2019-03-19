function Audios(){}
Audios.audios = {};
Audios.numAudios = 0;
Audios.numAudiosLoaded = 0;
Audios.maxFrequency = 0;
Audios.sampleRate = 0;
Audios.sampleStep = 0;
Audios.numSamples = 0;
Audios.add = function(name, path){
	if(Audios.audios[name] !== undefined) return Audios.audios[name];
	Audios.numAudios++;
	var htmlAudio = new Audio();
	htmlAudio.src = "resources/" + path;
	htmlAudio.loop = true;
	var audio = new ShaderAudio();
	audio.name = name;
	audio.path = path;
	audio.htmlAudio = htmlAudio;
	audio.location = gl.createTexture();
	audio.init();
	audio.htmlAudio.container_ = audio;
	audio.htmlAudio.loop = true;
	audio.htmlAudio.autoplay = true;
	Audios.audios[name] = audio;
	console.log(htmlAudio.src);
	return audio;
}
Audios.get = function(name){
	return Audios.audios[name];
}
Audios.load = function(callback){
/*	if(Audios.numAudios == 0) return callback();
	for(var a in Audios.audios){
		var audio = Audios.audios[a];
		audio.htmlAudio.container_ = audio;
		audio.htmlAudio.loop = true;
		audio.htmlAudio.autoplay = true;
		audio.htmlAudio.oncanplaythrough = function(){
			if(this.loaded_) return;
			this.loaded_ = true;
			console.log(this.src);
			Audios.numAudiosLoaded++
			if(Audios.numAudiosLoaded >= Audios.numAudios){
				callback(); // console.log("ready");
			}		
		} 
	} */
	callback();
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
	Audios.maxFrequency = this.context.sampleRate / 2.0;
	Audios.sampleRate = this.context.sampleRate;
	Audios.sampleStep = this.context.sampleRate / this.numSamples;
	Audios.numSamples = this.analyser.fftSize;
}
ShaderAudio.prototype.play = function(){
	this.htmlAudio.play();
}
ShaderAudio.prototype.stop = function(){
	this.htmlAudio.pause();
	this.htmlAudio.currentTime = 0;
}
ShaderAudio.prototype.pause = function(){
	this.htmlAudio.pause();
}
ShaderAudio.prototype.updateTexture = function(){
	this.analyser.getByteFrequencyData(this.audioData);
	if(Input.keyDown(32)){
		console.log(this.audioData);
	}
	gl.texImage2D(
		gl.TEXTURE_2D, 0, gl.LUMINANCE, this.numSamples, 1, 0,
		gl.LUMINANCE, gl.UNSIGNED_BYTE, this.audioData
	);
}