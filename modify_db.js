var mongo = require('mongodb');

var NAME_COLLECTION = "your_collection";
var DB_URL = "mongodb://127.0.0.1:27017/your_db";

var MongoClient = require('mongodb').MongoClient;    

MongoClient.connect(DB_URL, function(err, db) {
    if(err) throw err;

    var collection = db.collection(NAME_COLLECTION);
      // Locate all the entries using find
      collection.find().toArray(function(err, docs) {
		for (i=0;i<docs.length;i++) {
			console.log("Modify _id:"+docs[i]._id);
			modifyDate(collection, docs[i]);
		}
		db.close();
		console.log("End modification USER_CRASH_DATE");
      });      
})


function modifyDate(collection, doc){
	doc.USER_CRASH_DATE = new Date(doc.USER_CRASH_DATE);
	collection.update({_id:doc._id },   {
		$set: { 'USER_CRASH_DATE': doc.USER_CRASH_DATE },
	}, function(err) {
		if (!err) {
			console.log("Error:"+err);	
		} 
	});
}
