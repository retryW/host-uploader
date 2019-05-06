const fetch = require('ilp-fetch');
const moment = require('moment')
const Upload = require('./models/uploadModel.js');

// Codius manifest. Uses a pre-compiled docker image.
manifestJson = `{
  "manifest": {
    "name": "coil-test-manifest",
    "version": "1.0.0",
    "machine": "small",
    "port": "3000",
    "containers": [{
      "id": "app",
      "image": "calerobertson/coil-test-contract@sha256:3bd489f223d89714de5871b1e8604df116ce0ad8c1fc88bd0005ce92144fbe75",
	  "workdir": "/app"
    }]
  }
}`

// Upload pod to host
async function uploadPod(host, res){
dbHost = host;
host = "https://" + host;
// Hacky way to ban people. Till I setup proper auto bans
if(dbHost === "codius.ttmoonxr10.club"){
	res.render('pages/result', {
		output: 'This host has been banned due to abuse of this tool.',
		title: 'Host Banned!',
		success: 0,
		url: ''
	});
	return;
}
let resp
	try {
		// Send upload request to host
		resp = await fetch(`${host}/pods?duration=300`, {
			headers: {
			Accept: `application/codius-v1.0.3+json`,
			'Content-Type': 'application/json'
			},
			maxPrice: 1900, // Max price (reduce losses if someone scripts auto uploads with my tool)
			method: 'POST',
			body: JSON.stringify(manifestJson) // Manifest from above
		})
	
		const respJson = await resp.json()
		// If it works
		if (resp.status === 200) {
			// Get all the returned iformation
			const successObj = {
				url: respJson.url,
				manifestHash: respJson.manifestHash,
				host: host,
				expiry: respJson.expiry,
				expirationDate: moment(respJson.expiry).format('MM-DD-YYYY h:mm:ss ZZ'), // Make readable
				expires: moment().to(moment(respJson.expiry)), // Make readable
				pricePaid: resp.price
			}
		var title = "Successfully Uploaded Pods:";
		// Make the codius output more readable
		var output = `{
URL: ${successObj.url},
Manifest Hash: ${successObj.manifestHash},
Host: ${successObj.host},
Expiry: ${successObj.expiry},
Expiration Date: ${successObj.expirationDate},
Expires: ${successObj.expires},
Price Paid: ${successObj.pricePaid},
}`
		var url = `${successObj.url}`
		// Save stats to mongoDB
		var newUpload = Upload({
			hostname: `${dbHost}`,
			result: "success"
		});
		newUpload.save(function(err) {
			if (err) console.log(err);
			console.log('DB entry inserted!');
		});
		// Render results page, passing in values
		res.render('pages/result', {
			output: output,
			title: title,
			success: 1,
			url: url
		});
	  } else {
		throw new Error('Request Failed')
	  }
	} catch (err) {
		// If it failed tell the user
		const failedObj = {
			error: err.message,
			host
		}
		title = "Pod Upload Failed!:"
		output = failedObj.error;

		// Upload stats to mongoDB
		var newUpload = Upload({
			hostname: `${dbHost}`,
			result: "failure",
			output: `${failedObj.error}`
		});
		newUpload.save(function(err) {
			if (err) console.log(err);
			console.log('DB entry inserted!');
		});
		// Render page with passed values
		res.render('pages/result', {
			output: output,
			title: title,
			url: '',
			success: 0
		});
	}
}
exports.uploadPod = uploadPod;
