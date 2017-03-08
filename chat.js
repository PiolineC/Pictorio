$(document).ready(() => {
	//store node names for quick access
	let chatName = '.chat-name';
	let textArea = '.chat-textarea';				
	let messages = '.chat-messages';
	let status = '.chat-status span';
	let statusDefault = $(status).text();
	let statusDelay;
	let socket;

	function setStatus(s) {
		$(status).text(s);
		if (s !== statusDefault) {
			clearTimeout(statusDelay);
			statusDelay = setTimeout(() => { setStatus(statusDefault); }, 1500);
		}
	};
	
	try { socket = io.connect('http://127.0.0.1:3000'); }
	catch (err) { console.error('Failed to connect to server.'); }

	if (socket) {
		//listen for output
		socket.on('output', function onOutput(data) {
			if (data.length) {
				//loop through results and append message to chat
				for (let i of data) {
					let msg = document.createElement('div');
					msg.setAttribute('class', 'chat-message');
					msg.textContent = i.name + ': ' + i.message;
					$(messages).append(msg);
					$(messages).animate({ scrollTop: $(messages)[0].scrollHeight }, 0);							
				} 
			}
		});

		//listen for a status
		socket.on('status', function onStatus(data) {
			setStatus((typeof data === 'object') ? data.message : data)
			if (data.clear) $(textArea).val('');						
		});
		
		//listen for keydown
		$(textArea).keydown(function onKeydown(event) {
			if (event.which === 13 && !event.shiftKey) {
				socket.emit('input', {
					name: $(chatName).val(), 
					message: this.value
				})
				event.preventDefault();
			}
		});
	}
});