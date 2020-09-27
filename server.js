// Imports Here.
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
var jsonParser = bodyParser.json();
var cors = require('cors');
const { json } = require('body-parser');

function removeByAttr(arr, attr, value) {
	var i = arr.length;
	while(i--) {
		if (arr[i] && arr[i].hasOwnProperty(attr) && 
		(arguments.length > 2 && arr[i][attr].toString() === value)) {
			arr.splice(i,1);
		}
	}
	return arr;
}

// add middleware functions
app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));

app.post('/api/post-endpoint', jsonParser, (req,res) => {
	console.log('POST exec');
	const dataPosted = req.body;

	fs.readFile('data-store.json', (err, data) => {
		if (err && err.code === 'ENOENT') {
			console.log('file not found so creating one');
			const arr = [];
			arr.push(dataPosted);
			fs.writeFileSync('data-store.json',JSON.stringify(arr));
		} else {
			const dataInFile = (data.buffer.byteLength > 0) ? JSON.parse(data):[];
			dataInFile.push(dataPosted);
			fs.writeFileSync('data-store.json',JSON.stringify(dataInFile));
		}
		res.sendStatus(201);
	});
});


app.delete('/api/delete-endpoint/:id', (req, res, next) => {
	console.log('DELETE EXEC');
	let dontNotify = false;
	fs.readFile('data-store.json', (err, data) => {
		if (err && err.code === 'ENOENT') {
			console.log('data-store.json not found could not perform delete');
			res.status(400).send('<h3>No entries to delete!</h3>')
		} else {
			if(data) {
				const dataInFile = JSON.parse(data);
				const idToDelete = req.params.id;
				const initalLength = dataInFile.length;
				removeByAttr(dataInFile, 'id', idToDelete);
				dontNotify = (initalLength === dataInFile.length);
				fs.writeFileSync('data-store.json',JSON.stringify(dataInFile));
			}
			if(!dontNotify) res.status(200).send('<h3>Entry Deleted successully</h3>')
			else res.status(400).send('<h3>No such id</h3>');
		}
	});
});

app.get('/api/get-endpoint', (req,res) => {
	try {
		console.log('GET exec');
		let rawData = fs.readFileSync('data-store.json', 'utf-8');
		res.status(200).send(JSON.parse(rawData));
	} catch (err) {
		if ((err instanceof Error) && (err.code ==='ENOENT') ) {
			res.send('<h3> You have not posted any data to perform GET<h3>')
			console.log('File Not Found!');
		} else throw err;
	}
});

app.get('/', (req,res) => {
	res.status(200).send(`
	<p>Try below</p> 
	<ul>
		<li>http://localhost:3000/api/get-endpoint</li>
		<li>http://localhost:3000/api/post-endpoint</li>
		<li>http://localhost:3000/api/delete-endpoint/:id</li>
	</ul>
	`);
})

app.listen(3000, ()=>console.log('Started Server on http://localhost:3000'));

