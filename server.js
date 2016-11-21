(function() {
	var mongo = require("mongodb").MongoClient,
	client = require("socket.io").listen(3000).sockets;

	mongo.connect('mongodb://127.0.0.1/chat', function onDatabaseConnect(err, db) {
		if (err) throw err;

		client.on('connection', function onSocketConnect(socket) {

			var messageCollection = db.collection('messages');
			sendStatus = function(s) {
				socket.emit('status', s);
			}

			//emit all messages
			messageCollection.find().limit(100).sort({_id: 1}).toArray(function onMessagesRetrieved(err, data) {
				if (err) throw err;
				socket.emit('output', data);
			});

			//wait for input
			socket.on('input', function onInput(data) {
				var name = data.name,
					message = data.message;
					whitespacePattern = /^\s*$/;

				if (whitespacePattern.test(name) || whitespacePattern.test(message))
					sendStatus('Please enter a name and a message.');
				else {
					messageCollection.insert({
						name: name, 
						message: message
					}, function onInsert() {
						//emit latest message to all clients
						client.emit('output', [data]);

						sendStatus({
							message: 'Message sent!',
							clear: true
						});
					});
				}
			});
		});
	});
})();
