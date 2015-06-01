(function(root, factory){
	var _global = typeof global !== 'undefined' ? global : window,
		_mask = _global.mask || (_global.atma && _global.atma.mask); 
	
	if (_mask == null) {
		if (typeof require === 'function') {
			mask = require('maskjs');
		} else {
			throw Error('MaskJS was not loaded');
		}
	}
	
	factory(_global, _mask, _mask.Compo.config.getDOMLibrary());
	
}(this, function(global, mask, $){
	
	// import utils/obj.es6
	// import utils/form.es6
	// import utils/compo.es6
	// import utils/path.es6
	
	// import class/Xhr.es6
	// import class/Actor.es6
	// import class/Message.es6
	// import class/ValidationError.es6
	// import class/HttpError.es6
	
	// import partial/Transport.es6
	// import partial/Validation.es6
	// import partial/Builder.es6
	
	
	// import compo/Form.es6
	
	mask.registerHandler('a:form', FormDataCompo);
	//mask.registerHandler('a:form:json', FormJsonCompo);
}));
