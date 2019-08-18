const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(4000).sockets;

// Connects to Mongo
//simple connection
let url = 'mongodb://localhost:27017/chatapp';
//password connection
let urlPass = 'mongodb://user:pass@localhost/admin';

mongo.connect(url, { useNewUrlParser: true}, function(err, db) {
	if (err) {
		throw err;
	}

	console.log('MongoDB connected!');
	//db.close();

	// Connects to Socket.io
	client.on('connection', function(socket) {

		//select db
        let ChatDb = db.db("ChatDb");

		//select collection
		let chat = ChatDb.collection('chats');

		// Creates function to send/emit status of messages
		sendStatus = function(s) {
			socket.emit('status', s); 
		}

		// Gets chats from mongo collection
			//Limits to 100 chats only, then sorts them by id
		chat.find().limit(100).sort({_id:1}).toArray(function(err, res) {
			if (err) {
				throw er;
			}

			// Emits the messages
			socket.emit('output', res);
		});

		// Handles input events
		socket.on('input', function(data) {
			let name = data.name;
			let message = data.message;

			// Checks for the name and message
			if (name == '' || message == '') {
				// Sends error status
				sendStatus('Please enter a valid name and message');
			}
			else {
				chat.insert({name: name, message: message}, function() {
					client.emit('output', [data]);

					// Sends status object
					sendStatus({
						message: 'Message sent successfully',
						clear: true
					});
				});
			}
		});

		// Handles clearing function in index.html
		socket.on('clear', function(data) { //Uses the clear variable declared above
			// Removes all chats from collection
			chat.remove({}, function() {
				// Emits cleared
				socket.emit('Successfully cleared');
			});
		});	
	});
});

