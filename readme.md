## Form Component
[![Build Status](https://travis-ci.org/atmajs/compo-form.png?branch=master)](https://travis-ci.org/atmajs/compo-form)
[![Bower version](https://badge.fury.io/bo/compo-form.svg)](http://badge.fury.io/bo/compo-form)

_with Twitter Bootstrap classes_

```mask
a:form;
```

- [Attributes](#attributes)
- [API](#api)
- [Signals](#signals)
- [Slots](#slots)
- [Components](#components)
	
	#### Editors
	- [Input](#input)
	- [Checkbox](#checkobx)
	- [Radio](#radio)
	- [Select](#select)
	- [Text](#text)
	- [Input](#input)
	- [Template](#template)
	
	##### Ui
	- [Progress](#progress)
	- [Notification](#notification)


### Attributes

- `action` Default is the current location. Endpoint to submit the form data.
- `method` Default is `POST`. Http Method.
- `get` (`String or just a flag`). If specified, the component will load the model from the endpoint. When no endpoint is set then the `action` is used, with the `GET` http method.
- `content-type` Default is `application/json`. Accepts also: `multipart/form-data`
- `form-type` Default is ''. Accepts also `horizontal`, `inline`. Refer to the [Bootstrap Forms](http://getbootstrap.com/css/#forms)
- `offset`. Default is 0. When form type is `horizontal` this attribute defines the `col` size for labels.

_Mask interpolation are also supported_

```mask
// load the User model and display the form for it
a:form action='user/~[id]' method='PUT' get form-type=horizontal offset=4;
```

### Api

- `validate():string` Validate the model, and also all inner custom components (_if any_)

	To validate the custom components they must implement IValidation interface:
	```javascript
	IValidation {
		// return error description or Error instance when validation fails
		validate():string|Error
	}
	```
	
- `submit()` Collects form data from the model and inner custom components

	To get custom components data, implement IFormBuilder interface:
	```javascript
	IFormBuilder {
		// return json object, which is then merged with other data
		toJson():object
	}
	```
	
	Per default `a:form` sends json data. But if `multipart/form-data` is set for the content-type, then Json is tranformed to `FormData` instance. So you can upload also images and other binaries.

- `load(url)` Loads the model from remote and apply it to the form. This method is automaticaly called on render start, when `get` attribute is defined.
- `notify(type, message)` Notifies about any status changes

### Signals

`a:form` componenent emits signals to children on various states

- `formActivity(type, ...args)`

	Types:
	
	- `start`
	- `progress`: plus arguments `'load|upload', percent`
	- `end`
	- `error`: plus arguments `Error`
	
- `formNotification(notification: Object<type, message>`

### Slots

- `submit` Starts uploading data on the signal


### Components

`a:form` defines some nested components. Each component is placed in a template: [ItemLayout](src/compo/ItemLayout.mask)

### Editors

All editors have `dualbind` component, sothat they are bound to the model with a two-way data model binding type.

###### Input

Attributes:

- `property` (_required_): Value in a model to edit
- `type` (_optional_): HtmlInput type value: 'string/number/email/etc'
- `placeholder` (_optional_): HtmlInput placeholder
- `class` (_optional_): Css class names

```mask
a:form {
	Input property='some.foo';
}
```

Placeholders:
- `@label` (_optional_) Defines nodes for the `label` in a `.form-group`

	```mask
	a:form {
		Input property='some.foo' {
			@label > b > 'I am label'
		}
	}
	```

###### Text

`textarea`

Attributes:

- `property` (_required_): Value in a model to edit
- `placeholder` (_optional_): HtmlInput placeholder
- `rows` (_optional_): HtmlTextArea `rows` attribute
- `class` (_optional_): Css class names

```mask
a:form {
	Text property='description';
}
```

Placeholders:
- `@label` (_optional_)

###### Checkbox
Attributes:

- `property` (_required_): Value in a model to edit
- `text` (_required_): Input's label text
- `class` (_optional_): Css class names

```mask
a:form {
	Checkbox property='baz' text='Should handle baz';
}
```


Placeholders:
- `@label` (_optional_) Defines nodes for the `label` in a `.form-group`

	```mask
	a:form {
		Checkbox property='baz' text='Should handle baz' {
			@label > 'Lorem ipsum'
		}
	}
	```

###### Radio
Attributes:

- `property` (_required_): Value in a model to edit
- `class` (_optional_): Css class names

Placeholders:
- `@Option` (_required_) Defines each `Option` for the radio group

	```mask
	a:form {
		Radio property='letter' {
			@Option value='a' {
				// nodes
				'Letter A'
			}
			@Option value='b' > 'Letter B'
			@Option value='c' > 'Letter C'
		}
	}
	```
- `@label` (_optional_)


###### Select
Attributes:

- `property` (_required_): Value in a model to edit
- `class` (_optional_): Css class names

Placeholders:
- `@Option` (_required_) Defines each `Option` for the radio group

	```mask
	a:form {
		Select property='letter' {
			@Option value='a' {
				// nodes
				'Letter A'
			}
			@Option value='b' > 'Letter B'
			@Option value='c' > 'Letter C'
		}
	}
	```
- `@label` (_optional_)


###### Template
Use to define any other nested components and templates within the form layout

Placeholders:
- `@template` (_required_)

	```mask
	a:form {
		Template > @template {
			MyPicker > dualbind value='myvalue';
		}
	}
	```

### Ui

`a:form` has some default components to provide error/success/progress notifications.

##### Notification

See the implementation at [Notification.mask](/src/compo/Notification.mask)

##### Progress

See the implementation at [Notification.mask](/src/compo/Progress.mask)


## Examples

- [/examples](/examples)

```bash
# install atma toolkit
npm install atma -g
# run examples static server
npm run examples

# navigate `http://localhost:5777/examples/index.html?input`
```

### Test
```bash
npm test
```

:copyright: MIT - Atma.js Project