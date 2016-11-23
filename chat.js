(function() {
	var getNode = function(s) {
	return document.querySelector(s);
	}

	//get required nodes
	var chatName = getNode('.chat-name');
	var textArea = getNode('.chat-textarea');				
	var messages = getNode('.chat-messages');
	var status = getNode('.chat-status span')
	var statusDefault = status.textContent;
	var statusDelay;

	setStatus = function(s) {
		status.textContent = s;

		if (s !== statusDefault) {
			clearTimeout(statusDelay);
			statusDelay = setTimeout(function statusTimeout() {
				setStatus(statusDefault);
				clearInterval(statusDelay);
			}, 3000);
		}
	};
	
	try {
		var socket = io.connect('http://127.0.0.1:3000');
	} catch (e) {
		console.log('Failed to connect to server.');
	}

	if (socket !== undefined) {

		//listen for output
		socket.on('output', function onOutput(data) {
			if (data.length) {
				//loop through results and append message to chat
				for (var i = 0; i < data.length; i++) {
					var message = document.createElement('div');
					message.setAttribute('class', 'chat-message');
					message.textContent = data[i].name + ': ' + data[i].message;
					messages.appendChild(message);								
				} 
			}
		});

		//listen for a status
		socket.on('status', function onStatus(data) {
			setStatus((typeof data === 'object') ? data.message : data)

			if (data.clear) 
				textArea.value = '';						
		});
		//listen for keydown
		textArea.addEventListener('keydown', function onKeydown(event) {
			var self = this,
				name = chatName.value;

			if (event.which === 13 && !event.shiftKey) {
				socket.emit('input', {
					name: name, 
					message: self.value
				})

				event.preventDefault();
			}
		});
	}
})();