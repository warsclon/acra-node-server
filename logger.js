var mongo = require('mongodb');
var prop = require('./properties.js');
var email = require('./email.js');

var DB_NAME = prop.name_database;
 
var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;
 
var server = new Server(prop.mongodbIp, prop.mongodbPort, {auto_reconnect: true, safe:false,journal:true});
db = new Db(DB_NAME, server);
 
db.open(function(err, db) {
    if(!err) {
        console.log("Connected to data base ".yellow+DB_NAME.red);
		console.log("------------------".yellow);
    }
});

//Export detail log of app in json format
exports.findByIdDetailExport = function(req, res) {
    var appid = req.params.appid;
    var id = req.params.id;
    console.log('[' + appid + '] Retrieving log: ' + id);
    db.collection(appid, function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
};

//Export all logs of app in json format
exports.findAllExport = function(req, res) {
    var appid = req.params.appid;   
	console.log('entra find all '+appid);
    db.collection(appid, function(err, collection) {
		console.log('collection download');
        collection.find().toArray(function(err, items) {
			res.send(items);
        });
    });
};

// VIEW - /views/detail.ejs
exports.findByIdDetail = function(req, res) {
    var appid = req.params.appid;
    var id = req.params.id;
    console.log('[' + appid + '] Retrieving log: ' + id);
    db.collection(appid, function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.render('detail', {locals: {"log":item,"appid":appid,"id":id} });
        });
    });
};

// VIEW - /views/listLogs.ejs
exports.findAll = function(req, res) {
    var appid = req.params.appid;   
    db.collection(appid, function(err, collection) {
        collection.find().toArray(function(err, items) {
			res.render('listLogs', {locals: {"list":items,"appid":appid} });
        });
    });
};

// VIEW - /views/listMobiles.ejs
exports.findAllCollections = function(req, res) {
    db.collectionNames(function(err, names){ 
            if(!err){
				res.render('listApps', {locals: {"list":names,"dbname":prop.name_database}});
                db.close();
            }else{
                console.log(err);
                db.close();
            }
        });  
}; 

// VIEW - /views/delete.ejs
exports.deleteLog = function(req, res) {
    var appid = req.params.appid;
    var id = req.params.id;
    console.log('[' + appid + '] Deleting log: ' + id);
    db.collection(appid, function(err, collection) {
        collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
			res.render('delete', {locals: {"appid":appid,"err":err}});
        });
    });
}

// IMPORTANT - Method without security access
// Method to add info from  mobile
exports.addLog = function(req, res) {
    var appid = req.params.appid;
    var log = req.body;
    console.log('[' + appid + '] Adding log: mobile ' + log.PHONE_MODEL +" date:"+new Date());
    db.collection(appid, function(err, collection) {
        collection.insert(log, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
				//After insert send email
				email.send(appid,log);
                res.send(result[0]);
            }
        });
    });
}

exports.logout =  function (req, res) {
  req.session = null;
  res.clearCookie(prop.key);
  res.redirect('/index.html');
}