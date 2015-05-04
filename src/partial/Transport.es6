var Transport;
(function(){
	Transport = {
		getJson (url) {
			return new Xhr(url, 'GET').send();
		},
		upload (message) {
			var { endpoint, method  } = message;
			var body = message.serialize();
			
			var xhr = new Xhr(endpoint, method);
			
			return xhr
				.write(message.serialize())
				.writeHeaders(message.serializeHeaders())
				.send()
				;
		}
	};
	
}());