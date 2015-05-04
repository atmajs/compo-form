var Builder;
(function(){
	Builder = {
		createMessage (formCompo, params = {}) {
			var body = getJson(formCompo),
				contentType = params.contentType || formCompo.xContenType,
				endpoint = params.action || formCompo.xAction,
				method = params.method || formCompo.xMethod;
				
			return new Message(body, {
				contentType,
				endpoint,
				method
			});
		}
	};
	
	function getJson (formCompo) {
		var model = formCompo.model
		var data = mask.obj.extend({}, model);
		
		compo_walk(formCompo, compo => {
			var fn = compo.toJson || compo.toJSON;
			if (fn) {
				var json = fn.call(compo);
				mask.obj.extend(data, json);
				return { deep: false };
			}
		});
		return data;
	}
}());