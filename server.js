(() => {
	const express = require('express');
	const app = express();
	const server = require('http').createServer(app);
	const io = require('socket.io')(server);
	const mongo = require("mongodb").MongoClient;

	const Promise = require('bluebird');
	const connect = Promise.promisify(mongo.connect);
	let messages;

	connect('mongodb://127.0.0.1/chat')
		.then(db => { 
			messages = db.collection('messages');	
			io.on('connection', onSocketConnect);		
		})
		.catch(err => { throw err });

	server.listen(3000, () => console.log('listening on *:3000'));
		
	app.use(express.static('.'));
	app.get('/', (req, res) => res.sendFile('index.html'));

	function onSocketConnect(socket) {		
		//emit all messages
		messages.find().toArray((err, data) => {
			if (err) throw err;
			socket.emit('output', data);
		});

		//wait for input
		socket.on('input', data => sendStatus(socket, onInput(data)));
	}

	function sendStatus(socket, s) { 
		socket.emit('status', s);
	}

	function onInput(data) {
		let name = data.name;
		let message = data.message;
		let whitespacePattern = /^\s*$/;

		if (whitespacePattern.test(name) || whitespacePattern.test(message))
			return 'Please enter a name and a message.';
		else {
			messages.insert({name: name, message: message}, () => {
				//emit latest message to all clients
				io.emit('output', [data]);				
			});
			return { message: 'Message sent!', clear: true };
		}
	}
})();