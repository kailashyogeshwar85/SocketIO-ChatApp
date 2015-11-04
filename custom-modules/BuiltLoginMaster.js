var built=require('built.io');
var config={
			api_key :"blte775de3fdfef5d42",
			app_uid:"socketio"
};
//check built for login credentials
module.exports={

authenticateUser:function(email,pass,callback)
 {
 	
	var user=built.App(config.api_key,config.app_uid).User();
	user.login(email,pass)
			.then(function(data){
				console.log('successful login');
				callback(data);
			},
			function(err){
				console.log("Login failed");
				callback(null);
			 });		
 }

}
