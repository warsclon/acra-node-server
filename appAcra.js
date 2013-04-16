var express = require('express');
var colors = require('colors');
var prop = require('./properties.js');
var logger = require('./logger');


var app = express();

app.configure(function () {
	app.use(express.logger('default'));  /* 'default', 'short', 'tiny', 'dev' */
  app.use(express.bodyParser());
});

app.use(express.static(__dirname + '/public'));
app.use(express.favicon());
app.use(express.cookieParser());
app.use(express.cookieSession({
	key:prop.key,
	secret :prop.secret,
	cookie:{ path: '/', httpOnly: true, maxAge: null }
}));

app.use(clientErrorHandler);
app.use( express.bodyParser());
app.set('views', __dirname + '/views');  
app.set('view engine', 'ejs'); 

//function control errors
function clientErrorHandler(err, req, res, next) {
    console.log('client error handler found in ip:'+req.ip, err);
    res.send(500, 'ERROR:'+err);
}

var basicAuth = express.basicAuth(function(username, password) {
  return (username == prop.username && password == prop.password);
}, 'Restrict area, please identify');
  
//Mobile  without auth
app.post('/logs/:appid', logger.addLog);
//Administration with auth
app.get('/logs/:appid/:id', basicAuth, logger.findByIdDetail);
app.get('/logsexport/:appid/:id', basicAuth, logger.findByIdDetailExport);
app.get('/logs/:appid', basicAuth, logger.findAll);
app.get('/logsexport/:appid', basicAuth, logger.findAllExport);
app.get('/mobiles', basicAuth, logger.findAllCollections);
app.get('/logs/:appid/:id/delete', basicAuth, logger.deleteLog);
app.get('/logout', logger.logout);
  
console.log("------------------".yellow);
app.listen(prop.portWeb);
console.log('Listening on port '.yellow+prop.portWeb.red);

