function Storage(){};
Storage.cookie = {
	_json: function(){
		var cookie = $.cookie('settings');
		if(!cookie || cookie == ''){
			cookie = {};
		} else {
			cookie = $.parseJSON(cookie);
		}
		return cookie;
	},
	set: function(key, value){
		var json = Storage.cookie._json();
		json[key] = value;
		$.cookie('settings', JSON.stringify(json), {expires: 365, path: '/'});
	},
	get: function(key, defval){
		var json = Storage.cookie._json();
		if(json[key] === undefined){
			return defval;
		} else {
			return json[key];
		}
	},
};
Storage.window = {
	_json: function(){
		var name = window.name
		if(!name || name == ''){
			name = {};
		} else {
			name = $.parseJSON(name);
		}
		return name;
	},
	set: function(key, value){
		var json = Storage.window._json();
		json[key] = value;
		window.name = JSON.stringify(json);
	},
	get: function(key, defval){
		var json = Storage.window._json();
		if(json[key] === undefined){
			return defval;
		} else {
			return json[key];
		}
	},
};

	
