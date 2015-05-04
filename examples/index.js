(function(){
	io.File.disableCache()
	
	var server = require('atma-server');	


	include.exports = {
		process: function () {
			app.config.server.handlers = {
				'^/echo/' : EchoHandler,
				'^/error/' : ErrorHandler,
				'^/foo/' : FooService
			};

			app
				.findAction('server')
				.done(function(action){
					action.process({
						port: 5771,
					}, function(){});
				});
		}
	};

	var EchoHandler = {
		process: function(req, res) {
			if (req.body) {
				var body = typeof req.body === 'object' ? JSON.stringify(req.body) : req.body;
				res.writeHead(200, {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
				});
				
				res.end(body);
				return;
			}
			res.writeHead(200);
			req.pipe(res, { end: true });
		}
	};
	var ErrorHandler = {
		process: function(req, res) {
			var status = req.query.status || 500,
				message = req.query.message || 'Uknown error',
				body = JSON.stringify({ message: message});
				
			res.writeHead(status, {
				'Content-Type': 'application/json'
			});
			res.end(body);
		}
	};
	
	var FooService = server.HttpService({
		'single': function () {
			this.resolve({
				name: 'MyFooName'
			});
		}
	});
	
	
}());