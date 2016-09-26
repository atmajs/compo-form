var FormDataCompo = mask.Compo({
	tagName: 'form',

	builder: null,
	transport: null,

	model: null,
	entity: null,

	meta: {
		attributes: {
			'form-type': '',
			'content-type': 'application/json',
			'offset': 0,
			'method': 'POST',
			'method-edit': 'PUT',
			'detached-model': false,
			'action': window.location.href,
			'get': '',
			'redirect': '',
			'in-memory': false
		},
		template: 'merge'
	},
	attr: {
		style: 'position: relative;'
	},
	slots: {
		'submit': 'submit',
		'delete' () {
			this.removeEntity();
		}
	},
	events: {
		submit (event) {
			// any button click can cause the submit, so relay only on the signals
			event.preventDefault();
		},
		click (event) {
			// any button click can cause validation, so relay only on the signals
			event.preventDefault();	
		}
	},
	scope: {
		notificationMsg: '',
		notificationType: ''
	},
	submit  (event) {
		event.preventDefault();
		this.uploadEntity();
	},
	validate () {
		return Validation.process(this);
	},
	validateNative () {
		var el = this.$[0];
		if (el.checkValidity == null) return new Error;
		if (el.checkValidity()) return new Error;
		
		$('<button>').appendTo(this.$).click();
		return null; 
	},

	activity (type, ...args) {
		this.emitIn('formActivity', type, ...args);

		switch (type) {
			case 'start':
			case 'end':
				this.signalState('submit', type === 'end');
				break;
			case 'error':
				this.emitOut('error', args[0]);
				break;
		}
	},

	onRenderStart (model_, ctx) {
		var model = model_ || {};
		this.model = {
			entity: model
		};

		this.ensureReflect_();
		this.ensureCompo_('Notification');
		this.ensureCompo_('Progress');
		this.formLayout_();

		var $with = mask.jmask('+with (entity) > div');
		$with.children().append(this.nodes);
		this.nodes = $with;

		if (this.xGet) {
			this.model.entity = null;
			return this.loadEntity(
				Transport.getGetterEndpoint(this, model)
			);
		}
	},

	setEntity (model) {
		this.entity = model;
		this.notify();

		if (this.xDetachedModel === false) {
			this.model.entity = model;
			return;
		}

		var obj = this.model.entity || {};
		mask.obj.extend(obj, model);
		if (this.model.entity == null) {
			this.model.entity = obj;
		}
	},

	getEntity () {
		return this.entity || this.model.entity;
	},

	removeEntity (model) {
		this.activity('start');
		var x = model || this.getEntity(),
			message = Builder.createDeleteMessage(this, x);
		return Transport
			.send(message)
			.fail(error => this.errored_(error))
			.done((json) => {
				this.activity('end', 'delete');
				this.emitOut('complete', json);
				this.emitOut('formDelete', this.getEntity(), json);
			})
	},

	uploadEntity () {
		if (this.xhr && this.xhr.isBusy()) {
			return;
		}
		var error = this.validateNative();
		if (error) {
			return;
		}
		var error = this.validate();
		if (error) {
			this.errored_(new ValidationError(error));
			return;
		}
		if (this.xInMemory) {
			var json = Builder.getJson(this);
			this.emitOut('complete', json);
			return;
		}
		var message = Builder.createMessage(this);
		var error   = this.validateData(message.body);
		if (error) {
			this.errored_(new ValidationError(error));
			return;
		}
		this.activity('start');
		this.xhr = Transport
			.send(message)
			.fail(error => this.errored_(error))
			.done(json => {
				var msg = json.message || 'OK';
				if (this.xRedirect) {
					this.notify('success', `${msg}. Redirecting...`);
					window.location.href = this.xRedirect;
					return;
				}

				this.notify('success', msg);
				this.activity('end', 'upload', json);
				this.emitOut('complete', json);

				var method = message.method.toLowerCase();
				var name = method[0].toUpperCase() + method.substring(1);
				this.emitOut('form' + name, json, this.getEntity());
			});
	},

	loadEntity (url) {
		this.activity('start');
		return Transport
			.getJson(url)
			.fail(error => this.errored_(error))
			.done(model => {
				this.activity('end', 'load', model);
				this.setEntity(model);
				this.emitOut('formGet', model);
			});
	},

	transformData (json) {
		return json
	},

	validateData (json) {

	},

	toJson () {
		return Builder.getJson(this);
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
			.each(x => x.attr != null && (x.attr.offset = this.xOffset))
			;
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

// import Reflect.es6

var Template = `
	// import Controls/ItemLayout.mask
	// import Controls/Notification.mask
	// import Controls/Progress.mask
	// import Controls/Dialog.mask

	// import Editors/Array.mask
	// import Editors/Checkbox.mask
	// import Editors/Input.mask
	// import Editors/Select.mask
	// import Editors/Radio.mask
	// import Editors/Text.mask
	// import Editors/Template.mask
	// import Editors/Hidden.mask
	// import Editors/Image.mask
`;
mask.define(FormDataCompo, Template);