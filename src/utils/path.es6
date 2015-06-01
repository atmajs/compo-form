var path_interpolate,
	path_hasInterpolation;
(function(){
	
	path_interpolate = function (path, model) {
		return path.replace(rgx_EntityKey, (full, property) => {
			var key = mask.obj.get(model, property);
			return  key ? ('/' + key) : '';
		});
	};
	
	path_hasInterpolation = function (path) {
		return rgx_EntityKey.test(path);
	};
	
	var rgx_EntityKey = /\/:([\w\.]+)/;
}());