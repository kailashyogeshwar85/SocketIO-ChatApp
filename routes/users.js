var express = require('express');
var router = express.Router();
var scripts=require('./../cdnscripts.json');//cdn scripts

/* API routes handling here */
router.get('/test', function(req, res,next) {
  res.render('test',{title:'test',url:scripts});
  next();
});

module.exports = router;
