<?php
	
	function get_shader_src($file, $globals = false){
								
		$src = file_get_contents("shaders/" . $file);
		
		if($globals){
			$src = file_get_contents("shaders/core/globals.frag") . $src;
		}
		
		$regex = "/\#import \"[\w\/\.]+\"/";
		
		$matches;
		preg_match_all($regex, $src, $matches);
		
		foreach($matches[0] as $match){
			$filename = "nothing";
			preg_match('/"([^"]+)"/', $match, $filename); 	
			$content = file_get_contents("shaders/" . $filename[1]);
			$src = str_replace($match, $content, $src);
		}
		
		return $src;
	}
	
	function get_shader_bindings($file){		
		$path = "shaders/" . $file;
		if(file_exists($path)){
			return $path;
		}
		return null;
	}


?>