<?php
	require_once("shaders.php");
	$shaderName = isset($_GET["shader"]) ? $_GET["shader"] : "spheres";
	$shaderSrc = get_shader_src($shaderName.".frag", true);
	$shaderBindings = get_shader_bindings($shaderName.".js");
?>
<!DOCTYPE html>
<html><head>
	<title>Raymarching</title>
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
	<script src="jquery-3.2.1.min.js"></script>
	<script src="jquery.cookie.js"></script>
	<script src="gl-matrix/dist/gl-matrix.js"></script>
	<script src="storage.js"></script>
	<script src="gfw.js"></script>
	<script src="shader.js"></script>
	<script src="audios.js"></script>
	<script src="textures.js"></script>
	<script src="game.js"></script>
	<script src="shaders/core/default-bindings.js"></script>
	<?php if($shaderBindings !== null): ?>
	<script src="<?= $shaderBindings ?>"></script>
	<?php endif; ?>
	<link rel="stylesheet" type="text/css" href="gfw.css">
	<link rel="stylesheet" type="text/css" href="game.css">
	<script type="x-shader/x-vertex" id="vertex-shader-raymarching"><?= get_shader_src("core/raymarching.vert") ?></script>
	<script type="x-shader/x-fragment" id="fragment-shader-raymarching"><?= $shaderSrc ?></script>
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
