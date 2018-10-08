/*Server Serves a sampleForm and returns the JSON object
it received from the form to the user
and inserts records into the mongodb database*/

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const dbUsername = process.argv[2];
const dbPassword = process.argv[3]
const url = `mongodb://${dbUsername}:${dbPassword}1@ds125273.mlab.com:25273/halloween`;
let app = express();
const portNumber = 3000;

//New Syntax with Express 4
//Thanks https://stackoverflow.com/questions/24330014/bodyparser-is-deprecated-express-4
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
	res.status(200).sendFile(path.join( __dirname + '/public'));
});

app.post('/recordscore', (req, res) => {
	let registrant = req.body;
	//log registrant to console
	console.log(registrant);
	//return registrant form JSON submission to client
	res.status(200).json(registrant);
	MongoClient.connect(url,  { useNewUrlParser: true }, (err, db) => {
		if (err) throw err;
		let dbo = db.db("halloween");
		dbo.collection("halloween_users").insertOne(registrant, (err, res) => {
			if (err) throw err;
			console.log("1 Document inserted");
			db.close();
		})
	})
})
app.listen(portNumber, () => {
	console.log(`Server listening on port ${portNumber}`);
});