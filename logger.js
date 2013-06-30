var mongo = require('mongodb');
var prop = require('./properties.js');
var email = require('./email.js');
var moment = require('moment');
var async = require('async');
var ejs = require('ejs');

var DB_NAME = prop.name_database;

var Server = mongo.Server,
  Db = mongo.Db,
  BSON = mongo.BSONPure;

var server = new Server(prop.mongodbIp, prop.mongodbPort, {auto_reconnect: true, safe:false,journal:true});
var db= new Db(DB_NAME, server);

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
    console.log("findByIdDetailExport.appid:"+appid);    
    console.log("findByIdDetailExport.id:"+id);    
    db.collection(appid, function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
};

//Export all logs of app in json format
exports.findAllExport = function(req, res) {
    var appid = req.params.appid;
    console.log("findAllExport.appid:"+appid);    
    db.collection(appid, function(err, collection) {
        collection.find().toArray(function(err, items) {
			res.send(items);
        });
  });
};

// VIEW - /views/detail.ejs
exports.findByIdDetail = function(req, res) {
  var appid = req.params.appid;
  var id = req.params.id;
  console.log("findByIdDetail.appid:"+appid);    
  console.log("findByIdDetail.id:"+id);    
  db.collection(appid, function(err, collection) {
    collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
        res.render('detail', {locals: {"log":item,"appid":appid,"id":id} });
    });
  });
};

// VIEW - /views/listLogs.ejs
exports.findAll = function(req, res) {
    var appid = req.params.appid;
    console.log("findAll.appid:"+appid);    
    loadListLogs(appid,res);
};

// VIEW - /views/listMobiles.ejs
exports.findAllCollections = function(req, res) {
  console.log("findAllCollections");    
  db.collectionNames(function(err, names){ 
	res.render('listApps', {locals: {"list":names,"dbname":prop.name_database}});
  });  
}; 

// VIEW - /views/delete.ejs
exports.deleteLog = function(req, res) {
    var appid = req.params.appid;
    var id = req.params.id;
    console.log("deleteLog.appid:"+appid);    
    console.log("deleteLog.id:"+id);  
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
  console.log("addLog.appid:"+appid);    
  db.collection(appid, function(err, collection) {
    collection.insert(log, {safe:true}, function(err, result) {
      if (err) {
      	console.log("Add log error:"+err);
        res.send({'error':'An error has occurred'});
      } else {
				console.log("addLog:OK save");
				//format date text to date format
				//to aggregate dates
				formatDate(result,collection);
				//After insert send email
				email.send(appid,log);
        res.send(result[0]);
      }
    });
  });
}

function formatDate(toSave,collection) {
	var doc = toSave[0];
	doc.USER_CRASH_DATE = new Date(doc.USER_CRASH_DATE);
	collection.update({_id:doc._id },   {
		$set: { 'USER_CRASH_DATE': doc.USER_CRASH_DATE },
	}, function(err) {
		if (!err) {
			console.log("Error:"+err);	
		} else {
			console.log("Modify date format");	
		}
	});
}

//Logout and delete cookie
exports.logout =  function (req, res) {
  console.log("logout");    
  req.session = null;
  res.clearCookie(prop.key);
  res.redirect('/index.html');
}


//Function to read phones, dates and logs in parallel
function loadListLogs(appid,res) {
    var resultSearch = {};
    async.parallel([
        function(callback) {
            db.collection(appid, function(err, collection) {
		    collection.aggregate([
				{ $group : { _id : {android :"$ANDROID_VERSION"} , number : { $sum : 1 } } },
				{ $sort : { number : -1 } },
				{ $limit:10 },
		], function(err, result) {
            resultSearch.android = result;
            callback();
		});
	});
        },        function(callback) {
            db.collection(appid, function(err, collection) {
		    collection.aggregate([
				{ $group : { _id : {movile :"$PHONE_MODEL"} , number : { $sum : 1 } } },
				{ $sort : { number : -1 } },
				{ $limit:10 },
		], function(err, result) {
            resultSearch.agg_phone = result;
            callback();
		});
	});
        },
        function(callback) {
			db.collection(appid, function(err, collection) {
				collection.aggregate([
					{ $group : { _id : {year:{$year :"$USER_CRASH_DATE"},month:{$month :"$USER_CRASH_DATE"}} , number : { $sum : 1 } } },
					{ $sort : { _id : -1 } },
					{ $limit : 10 },				
				], function(err, result) {
					resultSearch.dates = result;
					callback();
				});
			});
        },
        function(callback) {        
            db.collection(appid, function(err, collection) {
                collection.find().toArray(function(err, items) {
            		for (var i = 0; i < items.length; i++) {
        				if (items[i].USER_APP_START_DATE.length > 0 ) {
        					items[i].USER_APP_START_DATE = moment(items[i].USER_APP_START_DATE).format(prop.date_format);
        				}
                    }	
                    resultSearch.logs = items;
    			    callback();
                });
            });
        }
    ], function(err) { 
        res.render('listLogs', {locals: {"list":resultSearch.logs,"mobiles":resultSearch.agg_phone,"android":resultSearch.android,"dates":resultSearch.dates,"appid":appid} });
    });
}

