'use strict';
angular.module('twiddler')
	.controller('loginCtrl',['$scope','builtAppConfig',function($scope,builtAppConfig){
	
	var config=builtAppConfig.getBuiltConfiguration();//gets the object
	
	var user=Built.App(config.api_key,config.app_uid).User();
		
	$scope.submitForm=function(isValid)
		{
			console.log('in submit');
			console.log(isValid);
			if(isValid)
			{
				// alert("valid");
				console.log("in spinner");
				var spinner=document.createElement('i')
				var btn=document.getElementById('b1');
				spinner.classList.add('icon-spinner','icon-spin','icon-large');
				btn.innerHTML ='Signing In ';
				btn.appendChild(spinner);
				return true;
			}
			else
			{
				return false;
			}
		}					
	}]);