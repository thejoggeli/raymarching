<?php
	require_once("shaders.php");
	
	$src = get_shader_src("play.frag");
	
	
	echo "<hr>" . str_replace("\n", "<br>", $src);
	
?>