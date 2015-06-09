mask.define(FormDataCompo, 'Reflect', {
	type: mask.Dom.COMPONENT,
	renderStart () {
		var set = jmask(this);
		
		var model = this.model;
		for(var key in model) {
			var val = model[key];
			if (val == null) {
				continue;
			}
			switch (typeof val) {
				case 'string':
				case 'number':
					set.append(createElement('Input', {
						type: typeof val,
						placeholder: key,
						property: key
					}));
					continue;
				case 'boolean':
					set.append(createElement('Checkbox', {
						property: key,
						text: key
					}));
					continue;
			}
		}
		function createElement(name, attr) {
			var label = jmask('@label').text(attr.property);
			return jmask(name).attr(attr).append(label)
		}
	}
});