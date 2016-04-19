var prop = require('./properties.js');
var email   = require("emailjs");

var server  = email.server.connect({
   user:    prop.user_mail, 
   password: prop.password_mail, 
   host:    prop.host, 
   ssl:     prop.ssl
});

exports.send = function send(mobile,log) {
	if (prop.send_mail == 'yes') {
		console.log('Send email with error model:'+log.PHONE_MODEL);
		// send the message and get a callback with an error or details of the message that was sent
		var text = "Error in "+ log.PHONE_MODEL+";\n";
		text += "Date crash:"+ log.USER_CRASH_DATE+"\n";
		text += "Android Version:"+log.ANDROID_VERSION+"\n";
		text += "App Version Name:"+log.APP_VERSION_NAME+"\n";
		text += "App Version Code:"+log.APP_VERSION_CODE+"\n";
		text += "Stack:"+log.STACK_TRACE+"\n";
		server.send({
		   text:    text, 
		   from:    prop.from,  
		   to:      prop.to,
		   cc:      "",
		   subject: prop.subject+ " from Mobile "+mobile
		}, (err, message) => 
			{ 
				console.log(err || message); 
			});
	}
}




