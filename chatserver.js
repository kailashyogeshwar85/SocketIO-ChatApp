var http;
var socketModule = require('./custom-modules/sockethandling');//custom module

module.exports={
	startChatServer:function(app)
	{
		http=require('http').Server(app);
		http.listen(app.get('port'),function(){
			console.log("Starting server at port "+app.get('port'));
			socketModule.startTwiddle(http);
		});
	}
}