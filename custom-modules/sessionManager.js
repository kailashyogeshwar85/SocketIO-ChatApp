module.exports=
	
	function isAuthenticated(req,res,next)
	{

		console.log("in authenticated")
		if(req.session.user)
		{
			req.isLoggedIn=true;
			console.log("Session active");
			console.log(req.session.user);
			
		}
		else
		{	
			req.session.user=null;
			req.isLoggedIn=false;
			console.log("No session");
		}

		next();
	}
