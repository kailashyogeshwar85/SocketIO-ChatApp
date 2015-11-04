var checkSession=require('./../custom-modules/sessionManager');
var express=require('express');
var router = express.Router();
var builtLoginMaster=require('./../custom-modules/BuiltLoginMaster');
var scripts=require('./../cdnscripts.json');//cdn scripts

//handle login authentication
router.post('/logincheck',function(req,res,next){
	console.log("got hit on authenticate url");
	var session=req.session;
	var email  = req.body.email;
	var pass   = req.body.password;
	builtLoginMaster.authenticateUser(email,pass,function(object){
		if(object!==null)
		{

			console.log('Rendering chat page and result');
			console.log("setting session");
			// console.log(session);
			session.user=object.toJSON();//set user object in session			
			// session.user.isAuth=true;
			res.render('home',{title:"Twiddle",
						 		url:scripts,
						 		user:object.toJSON()});
		}
		else{
				session.err="Invalid credentials";
			}
	});
	
});
//=============================Root file===========================
router.get('/',checkSession,function(req,res,next){

	console.log("after checked session");
	console.log(req.session);
	if(!req.isLoggedIn)
	{	
		console.log('user not logged in');
		res.render('login',{ title:'Login Page',
						 url:scripts,
						 session:req.session});
		
	}
	else
	{
			res.render('home',{title:"Twiddle",
						 		url:scripts,
						 		user:req.session})	;
			console.log("redirect to home");
	}
	});

router.get('/register',function(req,res,next){

	res.render('register',{ title:'Registration',
						 	url:scripts});
});
router.get('/test',function(req,res,next){
	res.render('test',{ title:'test',
						 	url:scripts});
});


module.exports = router;
