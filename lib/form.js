// source /src/umd.es6
"use strict";

(function (root, factory) {
	var _global = typeof global !== "undefined" ? global : window,
	    _mask = _global.mask || _global.atma && _global.atma.mask;

	if (_mask == null) {
		if (typeof require === "function") {
			mask = require("maskjs");
		} else {
			throw Error("MaskJS was not loaded");
		}
	}

	factory(_global, _mask, _mask.Compo.config.getDOMLibrary());
})(undefined, function (global, mask, $) {

	// source utils/obj.es6
	"use strict";

	var obj_toFlatObject, obj_getType;
	(function () {

		obj_getType = function (obj) {
			return Object.prototype.toString.call(obj).replace("[object ").replace("]");
		};
		obj_toFlatObject = function (mix, prefix) {
			var out = arguments[2] === undefined ? {} : arguments[2];

			if (mix == null) return out;

			var type = _getType(mix);

			if ("Array" === type) {
				mix.forEach(function (x, i) {
					obj_toFlatObject(x, prefix + "[" + i + "]", out);
				});
				return out;
			}

			if ("Object" === type) {
				if (prefix) prefix += ".";

				var key, x, prop;
				for (key in mix) {
					x = mix[key];
					prop = prefix + key;

					if (x == null) continue;

					var type = _getType(x);
					switch (type) {
						case "Object":
						case "Array":
							obj_toFlatObject(x, prop, out);
							continue;
						case "String":
						case "Number":
						case "Boolean":
						case "Blob":
							if (prop in out) {
								console.warn("ToFormData: Overwrite property", prop);
							}
							out[prop] = x;
							continue;
						default:
							console.error("Possible type violation", type);
							out[prop] = x;
							continue;
					}
				}
				return out;
			}

			switch (type) {
				case "String":
				case "Number":
				case "Boolean":
				case "Blob":
					break;
				default:
					console.error("Possible type violation", type);
					break;
			}

			if (prefix in out) {
				console.warn("ToFormData: Overwrite property", prefix);
			}
			out[prefix] = mix;
			return out;
		};
	})();
	//# sourceMappingURL=obj.es6.map
	// end:source utils/obj.es6
	// source utils/form.es6
	"use strict";

	var form_append;
	(function () {
		form_append = function (form, mix) {
			var name = arguments[2] === undefined ? "" : arguments[2];

			var data = obj_toFlatObject(mix, name);
			for (var key in data) {
				var filename = null;
				var val = data[key];

				if (typeof val === "object" && val.fileName) {
					filename = val.fileName;
				}
				if (filename != null) {
					form.append(key, val, filename);
					continue;
				}
				form.append(key, val);
			}
		};
	})();
	//# sourceMappingURL=form.es6.map
	// end:source utils/form.es6
	// source utils/compo.es6
	"use strict";

	var compo_walk;
	(function () {

		compo_walk = function (root, fn) {
			mask.TreeWalker.walk(root, function (compo) {
				if (compo === root) {
					return;
				}
				return fn(compo);
			});
		};
	})();
	//# sourceMappingURL=compo.es6.map
	// end:source utils/compo.es6
	// source utils/path.es6
	"use strict";

	var path_interpolate, path_hasInterpolation;
	(function () {

		path_interpolate = function (path, model) {
			return path.replace(rgx_EntityKey, function (full, property) {
				var key = mask.obj.get(model, property);
				return key ? "/" + key : "";
			});
		};

		path_hasInterpolation = function (path) {
			return rgx_EntityKey.test(path);
		};

		var rgx_EntityKey = /\/:([\w\.]+)/;
	})();
	//# sourceMappingURL=path.es6.map
	// end:source utils/path.es6
	// source utils/img.es6
	"use strict";

	var img_blobToBase64, img_fileToCanvas, img_scaleImage, img_scaleBlob;

	(function () {

		img_blobToBase64 = function (blob, cb) {
			var reader = new window.FileReader();
			reader.readAsDataURL(blob);
			reader.onloadend = function () {
				return cb(reader.result);
			};
		};
		img_fileToCanvas = function (file, cb) {
			var image = new Image();
			image.onload = function () {
				cb(imageToCanvas(image));
			};
			image.src = URL.createObjectURL(file);
		};
		img_scaleBlob = function (blob, w, h, cb) {
			blobToCanvas(blob, function (canvas) {
				canvas = resizeCanvas(canvas, w, h);
				canvasToBlob(canvas, cb);
			});
		};
		img_scaleImage = function (img, w, h, cb) {
			var canvas = imageToCanvas(img);
			canvas = resizeCanvas(canvas, w, h);
			canvasToBlob(canvas, cb);
		};

		function canvasToBlob(canvas, cb) {
			canvas.toBlob(cb, "image/jpeg", 0.9);
		}
		function blobToCanvas(blob, cb) {
			sourceToCanvas(URL.createObjectURL(blob), cb);
		}
		function sourceToCanvas(src, cb) {
			var image = new Image();
			image.onload = function () {
				cb(imageToCanvas(image));
			};
			image.src = src;
		}
		function imageToCanvas(img, x, y, w, h) {
			if (x == null) {
				x = 0;
				y = 0;
				w = img.width;
				h = img.height;
			}
			var canvas = document.createElement("canvas");
			canvas.width = w;
			canvas.height = h;

			var ctx = canvas.getContext("2d");
			ctx.fillStyle = "#ffffff";
			ctx.fillRect(0, 0, w, h);
			ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
			return canvas;
		}
		function resizeCanvas(canvas, w, h) {
			var scaled = document.createElement("canvas");
			scaled.width = w;
			scaled.height = h;

			var width = canvas.width,
			    height = canvas.height;

			var cropW = width,
			    cropH = height,
			    cropX = 0,
			    cropY = 0;

			if (Math.abs(w / h - width / height) > 0.05) {
				// adjust ratio
				var type;
				if (w > h) {
					cropH = width * h / w;
					if (cropH > height) {
						cropH = height;
						cropW = height * w / h;
					}
				}
				if (w < h) {
					cropW = height * w / h;
					if (cropW > width) {
						cropW = width;
						cropH = width * h / w;
					}
				}
			}
			cropX = (width - cropW) / 2;
			cropY = (height - cropH) / 2;
			scaled.getContext("2d").drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, w, h);
			return scaled;
		}
	})();
	//# sourceMappingURL=img.es6.map
	// end:source utils/img.es6

	// source class/Xhr.es6
	"use strict";

	var Xhr;
	(function () {
		/*
   * Events
   *  - start
   *  - error
   *  - progress ('load', percent) ('upload', percent)
   */
		Xhr = mask["class"].create(mask["class"].EventEmitter, mask["class"].Deferred, {
			constructor: function constructor(url, method) {
				this.url = url;
				this.method = method;

				this.xhr_ = null;
				this.loadPercent = 0;
				this.uploadPercent = 0;
				this.headers = {};
			},
			write: function write(data) {
				this.data = data;
				if (obj_getType(data) === "Object") {
					this.data = JSON.stringify(data);
				}
				return this;
			},
			writeHeaders: function writeHeaders(headers) {
				mask.obj.extend(this.headers, headers);
				return this;
			},
			setEndpoint: function setEndpoint(url, method) {
				this.url = url;
				this.method = method;
				return this;
			},
			isBusy: function isBusy() {
				return this.xhr_ != null;
			},
			loading_: function loading_(percent) {
				this.emit("progress", "load", this.loadPercent = percent);
			},
			uploading_: function uploading_(percent) {
				this.emit("progress", "upload", this.uploadPercent = percent);
			},
			readResponse_: function readResponse_(fn) {
				var xhr = this.xhr_;
				var response = xhr.responseText || "";
				var type = xhr.getResponseHeader("content-type");
				if (type == null) {
					return fn(Error("Content-Type not set"));
				}
				if (/json/i.test(type)) {
					try {
						response = JSON.parse(response);
					} catch (error) {
						return fn(Error("Json response malformed: " + String(error)));
					}
				}

				if (xhr.status === 200) {
					return fn(null, response);
				}
				return fn(this.toError_(xhr, response));
			},
			toError_: function toError_(xhr, resp) {
				var status = xhr.status,
				    message = xhr.responseText || xhr.statusText;
				if (resp != null && typeof resp === "object") {
					status = resp.status || status;
					message = resp.message || resp.error || message;
				}
				return new HttpError(message, status);
			},
			complete_: function complete_(error, data) {
				this.loading_(100);
				this.xhr_ = null;
				if (error) {
					this.emit("error", error);
					this.reject(error);
					return;
				}
				this.emit("complete", data);
				this.resolve(data);
			},

			send: function send() {
				var _this = this;

				if (this.isBusy()) {
					throw Error("Request is not reusable");
				}

				var xhr = this.xhr_ = new XMLHttpRequest();
				xhr.onload = function () {
					_this.readResponse_(function (error, data) {
						return _this.complete_(error, data);
					});
				};

				if (xhr.upload) {
					xhr.upload.onprogress = function (event) {

						if (event.lengthComputable) {
							var loaded = event.loaded,
							    total = event.total,
							    percent = event.loaded / event.total * 100 | 0;
							_this.uploading_(percent);
							return;
						}
						if (_this.uploadPercent < 90) {
							_this.uploading_(_this.uploadPercent + 10);
							return;
						}
						_this.uploading_(100);
					};
				}

				xhr.open(this.method, this.url);

				for (var key in this.headers) {
					xhr.setRequestHeader(key, this.headers[key]);
				}

				this.emit("start");
				xhr.send(this.data);
				return this;
			}
		});
	})();
	//# sourceMappingURL=Xhr.es6.map
	// end:source class/Xhr.es6
	// source class/Actor.es6
	"use strict";

	var IActor = mask["class"].create({
		run: function run(name) {
			var _this = this;

			for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
				args[_key - 1] = arguments[_key];
			}

			this.error = null;

			var actions = this[name],
			    result;

			args.unshift(this);
			actions.forEach(function (x) {
				if (_this.error) {
					return;
				}
				result = _this.perform(x, args);
			});
			return result;
		},
		perform_: function perform_(mix, args) {
			var fn = typeof mix === "string" ? this[mix] : mix;
			try {
				return fn.apply(null, args);
			} catch (error) {
				this.error = error;
				this.throw_(error);
			}
		},
		throw_: function throw_(error) {
			throw error;
		}
	});
	//# sourceMappingURL=Actor.es6.map
	// end:source class/Actor.es6
	// source class/Message.es6
	"use strict";

	var Message = mask["class"].create(Object.defineProperties({
		body: null,
		headers: null,
		method: "POST",
		endpoint: window.location.href,
		contentType: "application/json",

		constructor: function constructor(body) {
			var params = arguments[1] === undefined ? {} : arguments[1];

			this.body = body;
			this.headers = params.headers;

			if (params.endpoint) this.endpoint = params.endpoint;
			if (params.method) this.method = params.method;
			if (params.contenType) this.contentType = params.contentType;
		},
		serializeHeaders: function serializeHeaders() {
			var obj = {
				"Content-Type": this.contentType
			};
			return mask.obj.extend(obj, this.headers);
		},
		serialize: function serialize() {
			if (/form-data/i.test(this.contentType)) {
				return this.formData;
			}
			return JSON.stringify(this.body);
		}
	}, {
		formData: {
			get: function get() {
				var form = new global.FormData();
				form_append(form, this.body);
				return form;
			},
			configurable: true,
			enumerable: true
		}
	}));
	//# sourceMappingURL=Message.es6.map
	// end:source class/Message.es6
	// source class/ValidationError.es6
	"use strict";

	var ValidationError = mask["class"].createError("ValidationError", {
		constructor: function constructor(error) {
			if (error != null && typeof error === "object") {
				this.message = error.message || error.error || String(error);
			}
		},
		message: ""
	});
	//# sourceMappingURL=ValidationError.es6.map
	// end:source class/ValidationError.es6
	// source class/HttpError.es6
	"use strict";

	var HttpError = mask["class"].createError("HttpError", {
		status: 500,
		message: "",
		constructor: function constructor(message, status) {
			this.status = status;
			this.message = message;
		}
	});
	//# sourceMappingURL=HttpError.es6.map
	// end:source class/HttpError.es6

	// source partial/Transport.es6
	"use strict";

	var Transport;
	(function () {
		Transport = {
			getJson: function getJson(url) {
				return new Xhr(url, "GET").send();
			},
			getGetterEndpoint: function getGetterEndpoint(formCompo, model) {
				var xGet = formCompo.xGet;
				var endpoint = xGet === "get" || xGet === true ? formCompo.xAction : xGet;

				return path_interpolate(endpoint, model);
			},
			upload: function upload(message) {
				var endpoint = message.endpoint;
				var method = message.method;

				var body = message.serialize();
				var xhr = new Xhr(endpoint, method);

				return xhr.write(message.serialize()).writeHeaders(message.serializeHeaders()).send();
			}
		};
	})();
	//# sourceMappingURL=Transport.es6.map
	// end:source partial/Transport.es6
	// source partial/Validation.es6
	"use strict";

	var Validation;
	(function () {
		Validation = {
			process: function process(formCompo) {
				var error;
				compo_walk(formCompo, function (compo) {

					var name = compo.compoName;
					if (name === ":dualbind" || name === "dualbind") {
						error = compo.provider.validate();
						if (error) {
							return { "break": true };
						}
					}

					var fn = compo.validateUi || compo.validate;
					if (fn != null) {
						error = fn.call(compo);
						if (error) {
							return { "break": true };
						}
					}
				});
				return error;
			}
		};
	})();
	//# sourceMappingURL=Validation.es6.map
	// end:source partial/Validation.es6
	// source partial/Builder.es6
	"use strict";

	var Builder;
	(function () {
		Builder = {
			createMessage: function createMessage(formCompo) {
				var params = arguments[1] === undefined ? {} : arguments[1];

				var body = getJson(formCompo),
				    contentType = params.contentType || formCompo.xContenType,
				    endpoint = params.action || formCompo.xAction,
				    method = params.method || formCompo.xMethod;

				if (path_hasInterpolation(endpoint)) {
					endpoint = path_interpolate(endpoint, body);
					method = params.methodEdit || formCompo.xMethodEdit;
				}

				return new Message(body, {
					contentType: contentType,
					endpoint: endpoint,
					method: method
				});
			},
			getJson: getJson
		};

		function getJson(formCompo) {
			var entity = formCompo.model.entity,
			    model = toJson(entity, true),
			    data = mask.obj.extend({}, model);

			compo_walk(formCompo, function (compo) {
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
	})();
	//# sourceMappingURL=Builder.es6.map
	// end:source partial/Builder.es6

	// source compo/Form.es6
	"use strict";

	var FormDataCompo = mask.Compo({
		tagName: "form",

		builder: null,
		transport: null,

		model: null,
		entity: null,

		meta: {
			attributes: {
				"form-type": "",
				"content-type": "application/json",
				offset: 0,
				method: "POST",
				"method-edit": "PUT",
				"detached-model": false,
				action: window.location.href,
				get: "",
				redirect: "",
				"in-memory": false
			},
			template: "merge"
		},
		attr: {
			style: "position: relative;"
		},
		slots: {
			submit: "submit"
		},
		events: {
			submit: function submit(event) {
				return event.preventDefault();
			}
		},
		scope: {
			notificationMsg: "",
			notificationType: ""
		},
		submit: function submit(event) {
			event.preventDefault();

			this.upload();
		},
		validate: function validate() {
			return Validation.process(this);
		},

		activity: function activity(type) {
			for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
				args[_key - 1] = arguments[_key];
			}

			this.emitIn.apply(this, ["formActivity", type].concat(args));
			if ("start" === type) {
				this.signalState("submit", false);
			}
			if ("end" === type) {
				this.signalState("submit", true);
			}
		},

		onRenderStart: function onRenderStart(model_, ctx) {
			var model = model_ || {};
			this.model = {
				entity: model
			};

			this.ensureReflect_();
			this.ensureCompo_("Notification");
			this.ensureCompo_("Progress");
			this.formLayout_();

			var $with = mask.jmask("+with (entity) > div");
			$with.children().append(this.nodes);
			this.nodes = $with;

			if (this.xGet) {
				this.model.entity = null;
				return this.load(Transport.getGetterEndpoint(this, model));
			}
		},

		setEntity: function setEntity(model) {
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

		getEntity: function getEntity() {
			return this.entity || this.model.entity;
		},

		load: function load(url) {
			var _this = this;

			return Transport.getJson(url).fail(function (error) {
				return _this.errored_(error);
			}).done(function (model) {
				_this.activity("end", "load", model);
				_this.setEntity(model);
			});
		},

		toJson: function toJson() {
			return Builder.getJson(this);
		},
		upload: function upload() {
			var _this = this;

			if (this.xhr && this.xhr.isBusy()) {
				return;
			}
			var error = this.validate();
			if (error) {
				this.errored_(new ValidationError(error));
				return;
			}
			if (this.xInMemory) {
				var json = Builder.getJson(this);
				this.emitOut("complete", json);
				return;
			}
			var message = Builder.createMessage(this);

			this.activity("start");
			this.xhr = Transport.upload(message).fail(function (error) {
				return _this.errored_(error);
			}).done(function (json) {
				_this.notify("success", "OK");
				if (_this.xRedirect) {
					_this.notify("success", "OK. Redirecting...");
					window.location.href = _this.xRedirect;
					return;
				}

				_this.activity("end", "upload", json);
				_this.emitOut("complete", json);
			});
		},

		notify: function notify(type, message) {
			if (arguments.length === 0) {
				type = message = "";
			}
			this.scope.notificationType = type;
			this.scope.notificationMsg = message;
			this.emitIn("formNotification", { type: type, message: message });
		},

		ensureCompo_: function ensureCompo_(name) {
			var set = jmask(this).children(name);
			if (set.length !== 0) {
				return;
			}
			jmask(this).prepend(name);
		},
		ensureReflect_: function ensureReflect_() {
			var children = jmask(this).children();
			if (children.length === 0) {
				jmask(this).prepend("Reflect");
			}
		},

		formLayout_: function formLayout_() {
			var _this = this;

			var klass = "form";
			if (this.xFormType) {
				klass += "-" + this.xFormType;
				if (this.xOffset === 0 && this.xFormType === "horizontal") {
					this.xOffset = 1;
				}
			}
			jmask(this).addClass(klass).children().each(function (x) {
				return x.attr.offset = _this.xOffset;
			});
		},

		throw_: function throw_(error) {
			this.nodes = mask.parse("\n\t\t\tdiv style='background: red; color: white; padding: 15px; font-weight: bold' {\n\t\t\t\t\"" + error.message + "\"\n\t\t\t}\n\t\t");
		},

		errored_: function errored_(error) {
			this.activity("end");
			this.activity("error", error);
			this.notify("danger", error.message || String(error));
		}
	});

	// source Reflect.es6
	"use strict";

	mask.define(FormDataCompo, "Reflect", {
		type: mask.Dom.COMPONENT,
		renderStart: function renderStart() {
			var set = jmask(this);

			var model = this.model;
			for (var key in model) {
				var val = model[key];
				if (val == null) {
					continue;
				}
				switch (typeof val) {
					case "string":
					case "number":
						set.append(createElement("Input", {
							type: typeof val,
							placeholder: key,
							property: key
						}));
						continue;
					case "boolean":
						set.append(createElement("Checkbox", {
							property: key,
							text: key
						}));
						continue;
				}
			}
			function createElement(name, attr) {
				var label = jmask("@label").text(attr.property);
				return jmask(name).attr(attr).append(label);
			}
		}
	});
	//# sourceMappingURL=Reflect.es6.map
	// end:source Reflect.es6

	var Template = "\n\t// source Controls/ItemLayout.mask\n\tlet ItemLayout {\n\t\t.form-group {\n\t\t\t\n\t\t\tlabel.control-label.col-sm-@[attr.offset] {\n\t\t\t\t@label;\n\t\t\t}\n\t\t\t\n\t\t\t.col-sm-@[12-attr.offset] {\n\t\t\t\t@element;\n\t\t\t}\n\t\t}\n\t}\n\t// end:source Controls/ItemLayout.mask\n\t// source Controls/Notification.mask\n\tlet Notification as (div) {\n\t\t\n\t\tslot formNotification () {\n\t\t\tvar form = this.closest('a:form');\n\t\t\tif (!form.scope.notificationMsg) {\n\t\t\t\treturn;\n\t\t\t}\n\t\t\tvar el = this.$.get(0);\n\t\t\tif (el) {\n\t\t\t\tel.scrollIntoView(true);\n\t\t\t}\n\t\t}\n\t\t\n\t\t@if (template) {\n\t\t\t@template;\n\t\t}\n\t\t@else {\n\t\t\t+if (notificationMsg) {\n\t\t\t\t.alert.alert-~[bind: $scope.notificationType] > '~[bind: $scope.notificationMsg ]'\n\t\t\t}\n\t\t}\n\t}\n\t// end:source Controls/Notification.mask\n\t// source Controls/Progress.mask\n\tlet Progress {\n\t\tvar value = -1;\n\t\t\n\t\tslot formActivity (sender, type, name, percent) {\n\t\t\tif (type === 'start') {\n\t\t\t\tthis.$.fadeIn();\n\t\t\t}\n\t\t\tif (type === 'end') {\n\t\t\t\tthis.$.fadeOut();\n\t\t\t}\n\t\t\tif (type !== 'progress') {\n\t\t\t\treturn;\n\t\t\t}\n\t\t\tthis.scope.value = percent;\n\t\t}\n\t\t\n\t\t.-a-form-progress {\n\t\t\t\n\t\t\tprogress value='~[bind: $scope.value == -1 ? null : $scope.value]' max=100;\n\t\t\t\n\t\t\tstyle scoped {\n\t\t\t\t:host {\n\t\t\t\t\tbackground: rgba(0,0,0,.8);\n\t\t\t\t\tposition: absolute;\n\t\t\t\t\ttop: 0; left: 0; width: 100%; height: 100%;\n\t\t\t\t\tz-index: 999;\n\t\t\t\t\tdisplay: none;\n\t\t\t\t}\n\t\t\t\tprogress {\n\t\t\t\t\tposition: absolute;\n\t\t\t\t\ttop: 50%;\n\t\t\t\t\tleft: 1%;\n\t\t\t\t\twidth: 98%;\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n\t// end:source Controls/Progress.mask\n\t// source Controls/Dialog.mask\n\tlet Dialog {\n\t\tfunction show () {\n\t\t\tthis.$.modal('show');\n\t\t}\n\t\tfunction hide () {\n\t\t\tthis.$.modal('hide');\n\t\t}\n\t\t\n\t\tslot hide () {\n\t\t\tthis.hide();\n\t\t}\n\t\t\n\t\t.modal.fade\n\t\t\tdata-backdrop='@backdrop.attr.value'\n\t\t\tdata-keyboard='@keyboard.attr.value'\n\t\t\t\n\t\t> .modal-dialog > .modal-content {\n\t\t\t\t.modal-header {\n\t\t\t\t\t@if (backdrop.attr.value !== 'static') {\n\t\t\t\t\t\tbutton.close data-dismiss= modal > span > 'x';\n\t\t\t\t\t}\n\t\t\t\t\th4 .modal-title > @title;\n\t\t\t\t}\n\t\t\t\t@body > .modal-body style='position:relative; height:@attr.height' > @placeholder;\n\t\t\t\t.modal-footer {\n\t\t\t\t\t@footer;\n\t\t\t\t}\n\t\t\t}\n\t}\n\t// end:source Controls/Dialog.mask\n\t\n\t// source Editors/Array.mask\n\tlet Array {\n\t\t\n\t\tfunction getArray () {\n\t\t\tvar arr = mask.obj.get(this.model, this.attr.property);\n\t\t\tif (arr == null) {\n\t\t\t\tarr = [];\n\t\t\t\tmask.obj.set(this.model, this.attr.property, arr);\n\t\t\t}\n\t\t\treturn arr;\n\t\t}\n\t\t\n\t\tslot arrayItemRemove (event) {\n\t\t\tvar model = $(event.target).model(),\n\t\t\t\tarr = this.getArray(),\n\t\t\t\ti = arr.indexOf(model);\n\t\t\tarr.splice(i, 1);\n\t\t}\n\t\t\n\t\tslot arrayItemAdd () {\n\t\t\tvar arr = this.getArray(),\n\t\t\t\titem = {};\n\t\t\tarr.push(item);\n\t\t}\n\t\t\n\t\t\n\t\t\n\t\tinclude ItemLayout {\n\t\t\t@element {\n\t\t\t\t@header;\n\t\t\t\tul.list-unstyled > +each (@attr.property) {\n\t\t\t\t\tli style='position:relative; padding: 0px 15px; box-sizing: border-box;' {\n\t\t\t\t\t\t@template;\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\t@footer;\n\t\t\t}\n\t\t}\n\t\t\n\t\t\n\t}\n\t\n\t// end:source Editors/Array.mask\n\t// source Editors/Checkbox.mask\n\tlet Checkbox {\n\t\tinclude ItemLayout {\n\t\t\t@element {\n\t\t\t\tlabel {\n\t\t\t\t\tinput type='checkbox' class='@[attr.class]'>\n\t\t\t\t\t\t:dualbind value='@attr.property';\n\t\t\t\t\t\n\t\t\t\t\tspan > ' @[attr.text]'\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n\t// end:source Editors/Checkbox.mask\n\t// source Editors/Input.mask\n\tlet Input {\n\t\tinclude ItemLayout {\n\t\t\t@element {\n\t\t\t\tinput\n\t\t\t\t\tclass = 'form-control @attr.class'\n\t\t\t\t\ttype='@[attr.type || \"text\"]'\n\t\t\t\t\tplaceholder='@attr.placeholder' >\n\t\t\t\t\t\n\t\t\t\t\t\t:dualbind value='@attr.property';\n\t\t\t}\n\t\t}\n\t}\n\t\n\t// end:source Editors/Input.mask\n\t// source Editors/Select.mask\n\tlet Select {\n\t\tinclude ItemLayout {\n\t\t\t@element {\t\t\t\n\t\t\t\tselect .form-control {\n\t\t\t\t\t@if (option) {\n\t\t\t\t\t\t@each (option) > option value='@attr.value' {\n\t\t\t\t\t\t\t@placeholder;\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t\t@if (template) {\n\t\t\t\t\t\t@template;\n\t\t\t\t\t}\n\t\t\t\t\tdualbind value='@attr.property';\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n\t// end:source Editors/Select.mask\n\t// source Editors/Radio.mask\n\tlet Radio {\n\t\tinclude ItemLayout {\n\t\t\t@element {\n\t\t\t\t\n\t\t\t\t@each (Option) > .radio > label {\n\t\t\t\t\tinput type = radio name='@attr.property' value='@attr.value' class='@attr.class' >\n\t\t\t\t\t\t:dualbind value='@attr.property';\n\t\t\t\t\t\t\n\t\t\t\t\t@placeholder;\n\t\t\t\t}\n\t\t\t\t\n\t\t\t}\n\t\t}\n\t}\n\t// end:source Editors/Radio.mask\n\t// source Editors/Text.mask\n\tlet Text {\n\t\tinclude ItemLayout {\n\t\t\t@element {\n\t\t\t\ttextarea .form-control placeholder='@attr.placeholder'  rows='@[attr.rows || 4]' >\n\t\t\t\t\t:dualbind value='@attr.property';\n\t\t\t}\n\t\t}\n\t}\n\t// end:source Editors/Text.mask\n\t// source Editors/Template.mask\n\tlet Template {\n\t\tinclude ItemLayout {\n\t\t\t@element > @template;\n\t\t}\n\t}\n\t// end:source Editors/Template.mask\n\t// source Editors/Hidden.mask\n\tinput type='hidden' name='@attr.property' >\n\t\tdualbind value='@attr.property';\n\t// end:source Editors/Hidden.mask\n\t// source Editors/Image.mask\n\tlet Image {\n\t\t\n\t\tvar defaultUrl = 'http://placehold.it/200x100';\n\t\t\n\t\tfunction onRenderStart (model) {\n\t\t\tif (this.attr.default) {\n\t\t\t\tthis.scope.defaultUrl = this.attr.default;\n\t\t\t}\n\t\t\tvar prop = this.attr.property;\n\t\t\tvar val = mask.obj.get(model, prop);\n\t\t\t\n\t\t\tthis.model = {\n\t\t\t\turl: val || this.scope.defaultUrl,\n\t\t\t\tblob: null\n\t\t\t};\n\t\t\t\n\t\t\tmask.obj.bind(model, prop, function(val){\n\t\t\t\tthis.model.url = val;\n\t\t\t}.bind(this))\n\t\t}\n\t\t\n\t\tslot updateImage (event) {\n\t\t\tvar file = event.target.files[0];\n\t\t\tthis.model.url = URL.createObjectURL(file);\n\t\t\tthis.model.blob = file;\n\t\t\t\n\t\t\tmask.obj.set(this.model, this.attr.property, file);\n\t\t\treturn false;\n\t\t}\n\t\t\n\t\tinclude ItemLayout {\n\t\t\t@element {\n\t\t\t\ttable {\n\t\t\t\t\ttr > td > img src='~[bind: url]' style='max-width:200px; max-height: 100px;';\n\t\t\t\t\ttr > td {\n\t\t\t\t\t\tinput type='file' x-signal='change: updateImage';\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n\t\n\t// end:source Editors/Image.mask\n";
	mask.define(FormDataCompo, Template);
	//# sourceMappingURL=Form.es6.map
	// end:source compo/Form.es6

	mask.registerHandler("a:form", FormDataCompo);
});
//# sourceMappingURL=umd.es6.map
// end:source /src/umd.es6