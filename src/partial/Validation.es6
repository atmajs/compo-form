var Validation;
(function(){
	Validation = {
		process (formCompo) {
			var error;
			compo_walk(formCompo, compo => {
				var fn = compo.validateUi || compo.validate;
				if (fn != null) {
					error = fn.call(compo);
					if (error) {
						return { cursor: 'break' };
					}
				}
			});
			return error;
		}
	}
}());