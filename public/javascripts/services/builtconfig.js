angular.module('twiddler')
		.service('builtAppConfig', function($http){
			this.getBuiltConfiguration=function()
			{
				return config;
			}
		});

var config={
			api_key :"blte775de3fdfef5d42",
			app_uid:"socketio"
};