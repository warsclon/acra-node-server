var express = require('express');
var colors = require('colors');
var prop = require('./properties.js');
var logger = require('morgan');
var acraLogger = require('./logger.js');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')
var favicon = require('serve-favicon');
var session = require('express-session');
var basicAuth = require('basic-auth');

//function control errors
function clientErrorHandler(err, req, res, next) {
    console.log('client error handler found in ip:'+req.ip, err);
    res.sendStatus(500);
    res.render('error', {locals: {"error":err} });
}

var app = express();
app.use(express.static(__dirname + '/public'));
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(cookieParser());
app.use(clientErrorHandler);
app.set('views', __dirname + '/views');  
app.set('view engine', 'ejs'); 
app.use(logger('dev'));
app.use(bodyParser.json()); 

function auth (req, res, next) {
  function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.sendStatus(401);
  };
  var user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    return unauthorized(res);
  };

  if (user.name === prop.username && user.pass === prop.password) {
    return next();
  } else {
    return unauthorized(res);
  };
};

//Mobile  without auth
app.post('/logs/:appid', acraLogger.addLog);
app.put('/logs/:appid', acraLogger.addLog);

//Administration with auth
app.get('/logs/:appid/:id', auth, acraLogger.findByIdDetail);
app.get('/logsexport/:appid/:id', auth, acraLogger.findByIdDetailExport);
app.get('/logs/:appid', auth, acraLogger.findAll);
app.get('/logsexport/:appid', auth, acraLogger.findAllExport);
app.get('/mobiles', auth, acraLogger.findAllCollections);
app.get('/logs/:appid/:id/delete', auth, acraLogger.deleteLog);
app.get('/logout', acraLogger.logout);

prop.loadProperties(() => {
  acraLogger.open(prop, function(err) {
    app.use(session({
    secret: prop.secret,
    resave: false,
    saveUninitialized: false,
    cookie: { path: '/', httpOnly: true, secure: true, maxAge: null }
  }));
  console.log("------------------".yellow);
  app.listen(prop.portWeb);
  console.log('Listening on port '.yellow+prop.portWeb.red);
  });
});








 

 


