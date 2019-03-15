<?php
	require_once("shaders.php");
	$shader = isset($_GET["shader"]) ? ("$_GET[shader].frag") : "spheres.frag";
?>
<!DOCTYPE html>
<html><head>
	<title>Raymarching</title>
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
	<script src="jquery-3.2.1.min.js"></script>
	<script src="gl-matrix/dist/gl-matrix.js"></script>
	<script src="gfw.js"></script>
	<script src="shader.js"></script>
	<script src="game.js"></script>
	<link rel="stylesheet" type="text/css" href="gfw.css">
	<link rel="stylesheet" type="text/css" href="game.css">
	<script type="x-shader/x-vertex" id="vertex-shader-raymarching"><?= get_shader_src("core/raymarching.vert") ?></script>
	<script type="x-shader/x-fragment" id="fragment-shader-raymarching"><?= get_shader_src($shader) ?></script>
	<script type="x-shader/x-vertex" id="vertex-shader-texture"><?= get_shader_src("core/texture.vert") ?></script>
	<script type="x-shader/x-fragment" id="fragment-shader-texture"><?= get_shader_src("core/texture.frag") ?></script>
</head><body>
	<div id="left-anchor" class="noselect">
		<div id="monitor-box">
			<div class="monitor-header">Monitor</div>
		</div>
		<div id="controls-box">
			<div class="controls-header">Controls</div>
		</div>
		<button class="save-state" style="display:none">Save state</button>
	</div>
	<div class="toast">
		<div class="inner">
			<span class="toast-text">Toast</div>
		</div>
	</div>
</body></html>
