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
	- [Array](#array)
	- [Template](#template)
	
	#### Ui
	- [Progress](#progress)
	- [Notification](#notification)


### Attributes

- `action` Default is the current location. Endpoint to submit the form data to. Suppors **dynamic** Entity Key definition.

	```mask
	a:form action='/user/:userId';
	```
	
	> Now, when the model has the `userId` property, then the proper endpoint url is generated and the "edit" `method` is used. Otherwise the model is submited to the `/user` endpoint with the `POST` method.

- `method` Default is `POST` Http Method.
- `method-edit` Default is `PUT`. 
- `get` (`String or just a flag`). If specified, the component will load the model from the endpoint with the `GET` http method. When no endpoint is set then the `action` is used.  Suppors **dynamic** Entity Key definition.
- `content-type` Default is `application/json`. Accepts also: `multipart/form-data`
- `form-type` Default is `''`. Accepts also `horizontal`, `inline`. Refer to the [Bootstrap Forms](http://getbootstrap.com/css/#forms)
- `offset`. Default is `0`. When form type is `horizontal` this attribute defines the `col` size for labels.
- `redirect`. Default is _empty_. When form successfully submits the data it will redict the page to the specified url.

- `model-detached` (Default is `false`) :muscle:

	> The component creates its own model scope and set the to edit model to the `entity` property.
	
	_This flag defines if the model should be **shallow**-copied before setting to the `entity` property_

_Mask interpolation are also supported._

```mask
// load the User model and display the form for it
a:form action='/user/~[userId]' method='PUT' get form-type=horizontal offset=4;
```

> The example is similar to the **dynamic** Entity Key. But here we predefine the endpoint to be editable only.

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

- `setEntity(obj)` Set the new model and refresh the component

- `getEntity()` Get current components model

- `load(url)` Loads the model from remote and apply it to the form. This method is automaticaly called on render start, when `get` attribute is defined.
- `notify(type, message)` Notifies about any status changes

## Signals

`a:form` componenent emits signals to **children** on various states

- `formActivity(type, ...args)`

	Types:
	
	- `start`
	- `progress`: plus arguments `'load|upload', percent`
	- `end`
	- `error`: plus arguments `Error`
	
- `formNotification(notification: Object<type, message>`

## Slots

- `submit` Starts uploading data on the signal


## Components

`a:form` defines some nested components. Each component is placed in a template: [ItemLayout](src/compo/ItemLayout.mask)

### Editors

All editors have `dualbind` component, sothat they are bound to the model with a two-way data model binding type.

***

#### Input

**_Attributes_**:

- `property` (_required_): Value in a model to edit
- `type` (_optional_): HtmlInput type value: 'string/number/email/etc'
- `placeholder` (_optional_): HtmlInput placeholder
- `class` (_optional_): Css class names

```mask
a:form {
	Input property='some.foo';
}
```

**_Placeholders_**:
- `@label` (_optional_) Defines nodes for the `label` in a `.form-group`

	```mask
	a:form {
		Input property='some.foo' {
			@label > b > 'I am label'
		}
	}
	```

***

#### Text

`textarea`

**_Attributes_**:

- `property` (_required_): Value in a model to edit
- `placeholder` (_optional_): HtmlInput placeholder
- `rows` (_optional_): HtmlTextArea `rows` attribute
- `class` (_optional_): Css class names

```mask
a:form {
	Text property='description';
}
```

**_Placeholders_**:
- `@label` (_optional_)

***

#### Checkbox
**_Attributes_**:

- `property` (_required_): Value in a model to edit
- `text` (_required_): Input's label text
- `class` (_optional_): Css class names

```mask
a:form {
	Checkbox property='baz' text='Should handle baz';
}
```


**_Placeholders_**:
- `@label` (_optional_) Defines nodes for the `label` in a `.form-group`

	```mask
	a:form {
		Checkbox property='baz' text='Should handle baz' {
			@label > 'Lorem ipsum'
		}
	}
	```

***

#### Radio
**_Attributes_**:

- `property` (_required_): Value in a model to edit
- `class` (_optional_): Css class names

**_Placeholders_**:
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

***

#### Select
**_Attributes_**:

- `property` (_required_): Value in a model to edit
- `class` (_optional_): Css class names

**_Placeholders_**:
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

***

#### Array

Edit the arrays: edit items, add items, remove items.

- [Example](examples/array.mask)

Slots:
- `arrayItemAdd`
- `arrayItemRemove`

Attributes:
- `property`: Property of an array in a model to edit

Placeholders:
- `@template` is a template for each item
- `@header` is a template to be rendered **before** the list
- `@footer` is a template to be rendered **after** the list

***

#### Template

Wraps nested nodes in the [ItemLayout](src/compo/ItemLayout.mask). 

> Otherwise you can place any mask nodes inside the `a:form` component

**_Placeholders_**:
- `@template` (_required_)

	```mask
	a:form {
		Template > @template {
			MyPicker > dualbind value='myvalue';
		}
	}
	```
	
***

### Ui

`a:form` has some default components to provide error/success/progress notifications.

##### Notification

See the implementation at [Notification.mask](/src/compo/Notification.mask)

_**How to override**_

```javascript
mask.define('a:form', `
	let Notification {
		.my-status {
			h4 > '~[bind: $scope.notificationMsg ]'
		}
	}
`)
```

##### Progress

See the implementation at [Progress.mask](/src/compo/Progress.mask)


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