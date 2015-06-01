var Builder;
(function(){
	Builder = {
		createMessage (formCompo, params = {}) {
			var body = getJson(formCompo),
				contentType = params.contentType || formCompo.xContenType,
				endpoint = params.action || formCompo.xAction,
				method = params.method || formCompo.xMethod;
			
			if (path_hasInterpolation(endpoint)) {
				endpoint = path_interpolate(endpoint, body);
				method = params.methodEdit || formCompo.xMethodEdit;
			}
			
			return new Message(body, {
				contentType,
				endpoint,
				method
			});
		}
	};
	
	
	function getJson (formCompo) {
		var entity = formCompo.model.entity,
			model = toJson(entity, true),
			data = mask.obj.extend({}, model)
			;
		
		compo_walk(formCompo, compo => {
			var json = toJson(compo, false);
			if (json) {
				mask.obj.extend(data, json);
				return { deep: false };
			}
		});
		return data;
	}
	
	function toJson(mix, isSelf) {
		if (mix == null) {
			return null;
		}
		var fn = mix.toJson || mix.toJSON;
		if (fn == null) {
			return isSelf ? mix : null;
		}
		return fn.call(mix);
	}
}());