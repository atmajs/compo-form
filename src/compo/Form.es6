var FormDataCompo = mask.Compo({
	tagName: 'form',
	
	builder: null,
	transport: null,
	meta: {
		attributes: {
			'form-type': '',
			'content-type': 'application/json',
			'offset': 0,
			'method': 'POST',
			'action': window.location.href,
			'get': '',
			'redirect': ''
		},
		template: 'merge'
	},
	attr: {
		style: 'position: relative;'
	},
	slots: {
		submit: 'submit'
	},
	events: {
		submit (event) {
			return event.preventDefault();
		}
	},
	scope: {
		notificationMsg: '',
		notificationType: ''
	},
	submit  (event) {
		event.preventDefault();
		
		this.upload();
	},	
	validate () {
		return Validation.process(this);
	},
	
	activity (type, ...args) {
		this.emitIn('formActivity', type, ...args);
		if ('start' === type) {
			this.signalState('submit', false);
		}
		if ('end' === type) {
			this.signalState('submit', true);
		}
	},
	
	onRenderStart (model, ctx) {
		this.model = model;
		this.ensureReflect_();
		this.ensureCompo_('Notification');
		this.ensureCompo_('Progress');
		this.formLayout_();
		if (this.xGet) {
			var endpoint = this.xGet === 'get' || this.xGet === true
				? this.xAction
				: this.xGet;
			
			this.model = null;
			return this.load(endpoint);
		}
		if (this.model == null) {
			this.model = {};
		}
	},
	
	load (url) {
		return Transport
			.getJson(url)
			.fail(error => this.errored_(error))
			.done(model => {
				this.activity('end', 'load', model);
				this.updateModel_(model);
			});
	},
	
	upload () {
		if (this.xhr && this.xhr.isBusy()) {
			return;
		}
		var error = this.validate();
		if (error) {
			this.errored_(new ValidationError(error));
			return;
		}
		var message = Builder.createMessage(this);
		
		this.activity('start');
		this.xhr = Transport
			.upload(message)
			.fail(error => this.errored_(error))
			.done(json => {
				this.notify('success', 'OK');
				if (this.xRedirect) {
					this.notify('success', 'OK. Redirecting...');
					window.location.href = this.xRedirect;
					return;
				}
				
				this.activity('end', 'upload', json);
			});
	},
	
	notify (type, message) {
		if (arguments.length === 0) {
			type = message = '';
		}
		this.scope.notificationType = type;
		this.scope.notificationMsg  = message;
		this.emitIn('formNotification', { type, message });
	},
	
	ensureCompo_ (name) {
		var set = jmask(this).children(name);
		if (set.length !== 0) {
			return;
		}
		jmask(this).prepend(name);
	},
	ensureReflect_ () {
		var children = jmask(this).children();
		if (children.length === 0) {
			jmask(this).prepend('Reflect');
		}
	},
	
	formLayout_ () {
		var klass = 'form';
		if (this.xFormType) {
			klass += '-' + this.xFormType;
			if (this.xOffset === 0 && this.xFormType === 'horizontal') {
				this.xOffset = 1;
			}
		}
		jmask(this)
			.addClass(klass)
			.children()
			.each(x => x.attr.offset = this.xOffset)
			;		
	},
	
	
	
	updateModel_ (model) {
		if (this.model == null) {
			this.model = model;
			return;
		}
		for (var key in model){
			this.model[key] = model[key];
		}
	},
	throw_ (error) {
		this.nodes = mask.parse(`
			div style='background: red; color: white; padding: 15px; font-weight: bold' {
				"${error.message}"
			}
		`);
	},
	
	errored_ (error) {
		this.activity('end');
		this.activity('error', error);
		this.notify('danger', error.message || String(error));
	}
});

var Template = `
	// import Array.mask
	// import Checkbox.mask
	// import Input.mask
	// import Select.mask
	// import Radio.mask
	// import Text.mask
	// import Notification.mask
	// import Progress.mask
	// import Template.mask
	// import Hidden.mask
	// import ItemLayout.mask
`;

mask.registerFromTemplate(Template, FormDataCompo);

// import Reflect.es6
