const mongoose = require('mongoose');

function create(){
	var mongoDB = 'mongodb://redacted';
	mongoose.connect(mongoDB);
	mongoose.Promise = global.Promise;
	var db = mongoose.connection
	db.on('error', console.error.bind(console, 'MongoDB connection error:'));
};

function insert(obj, collection){
	MongoClient.connect('mongodb://redacted', (err, client) => {
		if (err) return console.log(err);
		var dbo = client.db('host-upload-db');
		var obj = {hostname: "test.example.com", datetime: "17/07/2018"}
		dbo.collection(collection).insertOne(obj, (err, res) => {
			if (err) return console.log(err);
			console.log('1 document inserted.');
			dbo.close();
		});
	});
};

function query(collection){
	MongoClient.connect('mongodb://redacted/', (err, client) => {
		if (err) throw err;
		var dbo = client.db("host-upload-db");
		dbo.collection(collection).find({}, {hostname: 1, timestamp: 1}).toArray((err, result) => {
			if (err) throw err;
			console.log(result);
			dbo.close();
		});
	});
};

exports.create = create;
exports.insert = insert;
exports.query = query;