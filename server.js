#!/usr/bin/env node
// server.js

// load the things we need
const express = require('express');
const proxy = require('express-http-proxy');
const app = express();
const bodyParser = require('body-parser');
const util = require('util');
const uploader = require('./uploader');
const Upload = require('./models/uploadModel.js');
const Ban = require('./models/banModel.js');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use('/.well-known/pay', proxy('localhost:8080'));
app.use('/favicon.ico', express.static('images/favicon.ico')); // Browser icon

// set the view engine to ejs
app.set('view engine', 'ejs');

// index page GET
app.get('/', function(req, res) {
	var customTimeout = 300000 // 5 minutes
	res.setTimeout(customTimeout, function(){
    console.log("TIMED!");
    res.render('pages/result', { 
			output: '504 Gateway Timeout: The codius host never responded to the request.',
			title: 'Pod Upload Failed!:'
		});
	});
	let query = [
		Upload.count({result: "success"}),
		Upload.findOne({result: "success"}, {}, {sort: {'created_at' : -1}})
	];
	// Wait for stats from DB, then render index page
	Promise.all(query)
	.then(results => {
		res.render('pages/index', {
			count: results[0],
			latest: results[1].toObject().hostname
		});
	})
	.catch(err => {
		console.error('Error fetching data: ', err);
		res.render('pages/index', {
			count: 0,
			latest: ''
		});
	});
});

// Troubleshooting page
app.get('/help', function(req, res) {
    res.render('pages/troubleshooting');
});

// index page POST
app.post('/', async (req, res) => {
	// If hostname was empty, tell them
	if(req.body.hostname == null || req.body.hostname === '') {
		res.render('pages/result', {
			output: "Hostname cannot be empty.",
			title: "Invalid hostname",
			url: '',
			success: 0
		});
		return;
	}
	// hacky way to ban people
	if(req.body.hostname == "codius.ttmoonxr10.club") {
		res.render('pages/result', {
			output: 'This host has been banned due to abuse of this tool.',
			title: 'Host Banned!',
			success: 0,
			url: ''
		});
		return;
	}
	var customTimeout = 300000
	var output = '';
	var error = '';
	var input = req.body.hostname;
	console.log(input);
	// Timout function, actual function at end
	res.setTimeout(customTimeout, function(){
		console.log("TIMED!");
		var newUpload = Upload({
			hostname: input,
			result: "failure",
			output: "504 Gateway Timeout"
		});
		newUpload.save(function(err) {
			if (err) console.log(err);
			console.log('DB entry inserted!');
		});
		res.render('pages/result', { 
				output: '504 Gateway Timeout: The codius host never responded to the request.',
				title: 'Pod Upload Failed!:',
				url: '',
				success: 0
		});
		// Dodges error when second promise tries to return
		return;
	});
	// Upload pod to host
	await uploader.uploadPod(input, res);
});

// Listen on the best port
app.listen(1337);
console.log('1337 is the magic port');
