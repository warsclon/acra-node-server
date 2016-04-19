var mongo = require('mongodb');
var email = require('./email.js');
var moment = require('moment');
var async = require('async');
var ejs = require('ejs');

var l = {
    server: null,
    db: null,
    prop: null,
    open: function(p) {
        l.prop = p;
        l.server = new mongo.Server(l.prop.mongodbIp, l.prop.mongodbPort, {auto_reconnect: true, safe:false,journal:true});
        l.db = new mongo.Db(l.prop.name_database, l.server);
        l.db.open(function(err, db) {
            if(!err) {
                console.log("Connected to data base ".yellow+l.prop.name_database.red);
                console.log("------------------".yellow);
            }
        });
    }
};

//Export detail log of app in json format
l.findByIdDetailExport = function(req, res) {
    var appid = req.params.appid;
    var id = req.params.id;
    console.log("findByIdDetailExport.appid:"+appid);    
    console.log("findByIdDetailExport.id:"+id);    
    l.db.collection(appid, function(err, collection) {
        collection.findOne({'_id':new mongo.BSONPure.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
};

//Export all logs of app in json format
l.findAllExport = function(req, res) {
    var appid = req.params.appid;
    console.log("findAllExport.appid:"+appid);    
    l.db.collection(appid, function(err, collection) {
        collection.find().toArray(function(err, items) {
			res.send(items);
        });
  });
};

// VIEW - /views/detail.ejs
l.findByIdDetail = function(req, res) {
  var appid = req.params.appid;
  var id = req.params.id;
  console.log("findByIdDetail.appid:"+appid);    
  console.log("findByIdDetail.id:"+id);    
  l.db.collection(appid, function(err, collection) {
    collection.findOne({'_id':new mongo.BSONPure.ObjectID(id)}, function(err, item) {
        res.render('detail', {log: item, appid: appid, id: id});
    });
  });
};

// VIEW - /views/listLogs.ejs
l.findAll = function(req, res) {
    var appid = req.params.appid;
    console.log("findAll.appid:"+appid);    
    loadListLogs(appid,res);
};

// VIEW - /views/listMobiles.ejs
l.findAllCollections = function(req, res) {
    console.log("findAllCollections");    
    l.db.listCollections().toArray(function(err, names) {
        res.render('listApps', { list: names, dbname: l.prop.name_database });
    });  
}; 

// VIEW - /views/delete.ejs
l.deleteLog = function(req, res) {
    var appid = req.params.appid;
    var id = req.params.id;
    console.log("deleteLog.appid:"+appid);    
    console.log("deleteLog.id:"+id);  
    l.db.collection(appid, function(err, collection) {
        collection.remove({'_id':new mongo.BSONPure.ObjectID(id)}, {safe:true}, function(err, result) {
    	    res.render('delete', {appid: appid, err: err});
        });
    });
}

// IMPORTANT - Method without security access
// Method to add info from  mobile
l.addLog = function(req, res) {
  var appid = req.params.appid;
  var log = req.body;
  console.log("addLog.appid:"+appid);    
  l.db.collection(appid, function(err, collection) {
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
l.logout =  function (req, res) {
  console.log("logout");    
  req.session = null;
  res.clearCookie(l.prop.key);
  res.redirect('/index.html');
}


//Function to read phones, dates and logs in parallel
function loadListLogs(appid,res) {
    var resultSearch = {};
    async.parallel([
        function(callback) {
            l.db.collection(appid, function(err, collection) {
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
            l.db.collection(appid, function(err, collection) {
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
			l.db.collection(appid, function(err, collection) {
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
            l.db.collection(appid, function(err, collection) {
                collection.find().toArray(function(err, items) {
            		for (var i = 0; i < items.length; i++) {
        				if (items[i].USER_APP_START_DATE.length > 0 ) {
        					items[i].USER_APP_START_DATE = moment(items[i].USER_APP_START_DATE).format(l.prop.date_format);
        				}
                    }	
                    resultSearch.logs = items;
    			    callback();
                });
            });
        }
    ], function(err) { 
        res.render('listLogs', {list: resultSearch.logs, mobiles: resultSearch.agg_phone, android: resultSearch.android, dates: resultSearch.dates, appid: appid});
    });
}

module.exports = l;