
var songs = [
	"music/BRD-Teleport-Prokg.mp3",
	"music/CHiCNCREAM - WinRARDosRAR3.50ru crk.mp3",
	"music/Dt&Pd_wc.mp3",
	"music/EliMiNATiON - Super Mp3 Editor 4.2kg.mp3",
	"music/EMBRACE - PgcEdit 9.1 kg.mp3",
	"music/Grand Lord - Narcis Dictionary 5b202 crk.mp3",
	"music/Jeckson - WinRAR 3.60 beta 5 rucrk.mp3",
	"music/OUTLAWS - Devastro kg.mp3",
	"music/Razor1911 - Half-Life Blue Shift cracktro.mp3",
	"music/SnD - Internet Download Manager 6.xx kg.mp3",
	"music/TFT - Alcohol120 1.9.5.3105crk2.mp3", 
];
var songId = 0;
James.onInit = function(shader){
	
	glMatrix.vec3.set(Camera3d.position, 0, 1.7, 10);

	// texture
	var texture = Textures.add("texture", "noise-1.jpg");
	shader.addChannel("texture", texture);	
	
	// music
	var music = Audios.add(songs[0], songs[0]);
	shader.addChannel("music", music);
	shader.setChannel("music", music);
	
	// music
	var freq = Audios.add("freq", "music/frequency-test.mp3");
	shader.addChannel("freq", freq);
	freq.stop();
	
}

James.onStart = function(shader){
	Audios.get("freq").volume = 0.0;
}
James.onUpdate = function(shader){
	if(Input.keyDown(48)){
		if(++songId >= songs.length) songId = 0;
		var music = Audios.add(songs[songId], songs[songId]);
		shader.setChannel("music", music);
	}
	if(Input.keyDown(48+9)){
		Audios.add("freq").play();
	}
}