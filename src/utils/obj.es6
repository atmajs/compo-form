var obj_toFlatObject,
	obj_getType;
(function(){
	
	obj_getType = function (obj) {
		return Object
			.prototype
			.toString
			.call(obj)
			.replace('[object ')
			.replace(']')
			;
	};
	obj_toFlatObject = function (mix, prefix, out = {}){
		if (mix == null)
			return out;

		var type = _getType(mix);

		if ('Array' === type) {
			mix.forEach(function(x, i){
				obj_toFlatObject(x, prefix + '[' + i + ']', out);
			});
			return out;
		}

		if ('Object' === type) {
			if (prefix) 
				prefix += '.';
		
			var key, x, prop;
			for(key in mix){
				x = mix[key];
				prop = prefix + key;

				if (x == null)
					continue;

				var type = _getType(x);
				switch (type) {
					case 'Object':
					case 'Array':
						obj_toFlatObject(x, prop, out);
						continue;
					case 'String':
					case 'Number':
					case 'Boolean':
					case 'Blob':
						if (prop in out){
							console.warn('ToFormData: Overwrite property', prop);
						}
						out[prop] = x;
						continue;
					default: 
						console.error('Possible type violation', type);
						out[prop] = x;
						continue;
				}
			}
			return out;
		}

		switch(type) {
			case 'String':
			case 'Number':
			case 'Boolean':
			case 'Blob':
				break;
			default:
				console.error('Possible type violation', type);
				break;
		}

		if (prefix in out){
			console.warn('ToFormData: Overwrite property', prefix);
		}
		out[prefix] = mix;
		return out;
	};
	
}());