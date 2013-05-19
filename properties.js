var proper = require("node-properties-parser");
var colors = require('colors');

var PORT_WEB = "port_web";
var MONGODB_PORT = "mongodb_port";
var MONGODB_IP = "mongodb_ip";
var USERNAME = "username";
var PASSWORD = "password";
var NAME_DATABASE = "name_database";
var KEY = "key";
var SECRET = "secret";
var SEND_MAIL = "send_mail";
var USER_MAIL = "user_mail";
var PASSWORD_MAIL = "password_mail";
var HOST = "host";
var SSL = "ssl";
var SUBJECT = "subject";
var FROM = "from";
var TO = "to";

console.log("------------------------".red);
console.log("ACRA SERVER LOG 0.0.2".bold.red);
console.log("------------------------".red);
console.log("Loading properties sync before start server...".red);
var par = proper.readSync("./acra_server.properties");

console.log("------------------------".red);

exports.portWeb = portWeb = par[PORT_WEB];
console.log("port_web:"+portWeb.red);

exports.mongodbPort = mongodbPort = par[MONGODB_PORT];
console.log("mongodbPort:"+mongodbPort.red);

exports.mongodbIp = mongodbIp = par[MONGODB_IP];
console.log("mongodbIp:"+mongodbIp.red);

exports.username = username = par[USERNAME];
console.log("username:"+username.red);

exports.password = password = par[PASSWORD];
console.log("password:"+password.red);

exports.name_database = name_database = par[NAME_DATABASE];
console.log("name_database:"+name_database.red);

exports.secret = secret = par[SECRET];
console.log("secret:"+secret.red);

exports.key = key = par[KEY];
console.log("key:"+key.red);

exports.send_mail = send_mail = par[SEND_MAIL];
console.log("send_mail:"+send_mail.red);

exports.user_mail = user_mail = par[USER_MAIL];
console.log("user_mail:"+user_mail.red);

exports.password_mail = password_mail = par[PASSWORD_MAIL];
console.log("password_mail:"+password_mail.red);

exports.host = host = par[HOST];
console.log("host:"+host.red);

exports.ssl = ssl = par[SSL];
console.log("ssl:"+ssl.red);

exports.subject = subject = par[SUBJECT];
console.log("subject:"+subject.red);

exports.from = from = par[FROM];
console.log("from:"+from.red);

exports.to = to = par[TO];
console.log("to:"+to.red);

exports.date_format = date_format = par[DATE_FORMAT];
console.log("date_format:"+date_format.red);

console.log("------------------------".red);



