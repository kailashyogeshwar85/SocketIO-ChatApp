module.exports=
//making session accessible in views
	function sessions(req,res,next)
	{
		console.log('In middle ware');
		res.locals.session=req.session;
		next();
	}