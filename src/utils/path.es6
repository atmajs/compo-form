var path_interpolate,
	path_hasInterpolation,
	path_getKey;
(function(){
	
	path_interpolate = function (path, model) {
		return path.replace(rgx_EntityKey, (full, property) => {
			var key = mask.obj.get(model, property);
			return  key ? ('/' + key) : '';
		});
	};
	
	path_getKey = function (path) {
		var match = rgx_EntityKey.exec(path);
		return match == null ? null : match[1];
	};
	
	path_hasInterpolation = function (path) {
		return rgx_EntityKey.test(path);
	};
	
	var rgx_EntityKey = /\/:([\w\.]+)/;
}());