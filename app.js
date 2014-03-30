var express = require('express'),
	http = require('http'),
	app = express(),
    sio = require('socket.io'), io,
	murmurhash = require('murmurhash');

/* Keep a global list of currently connected clients */
var game = {},
	socketPlayers = {};


app.set('port', 8080);

app.enable('strict routing');
app.use('/game/', express.static(__dirname + '/game'));

var server = http.createServer(app).listen(app.get('port'), function () {
	console.log('Express server listening on port ' + app.get('port'));
});

io = sio.listen(server, { log: false });

function send(msg, to, data) {
	// Check that the client has already joined successfully,
	// then foward the message to client
	if (socketPlayers[to] !== undefined) {
		socketPlayers[to].emit(msg, data);
	}
}


/* Listen for and handle socket.io connections */
io.sockets.on("connection", function(socket) {
	/* Handle requests to join the chat-room */
	socket.on('gencode', function(info, callback) {
		var code = info.code;
		if(code === null) {
			var time = new Date();
			var id = parseInt(murmurhash.v2(time.toString() + " - " + time.getMilliseconds()), 10);
			game[id] = [socket.id];
			socket.game = id;
			socketPlayers[socket.id] = socket;
			callback(id, socket.id);
		} else if(game[code] !== null) {
			if(game[code].length >= 2) {
				callback(false);
			} else {
				game[code].push(socket.id);
				socket.game = code;
				socketPlayers[socket.id] = socket;
				callback(code, socket.id);
			}
		} else {
			callback(false);
		}
	});

	/* move player */
	socket.on("moveplayer", function(info) {
		if(game[info.gameid]!=null && game[info.gameid].length > 1) {
			if(game[info.gameid][0] === info.id) {
				id = game[info.gameid][1];
			} else {
				id = game[info.gameid][0];
			}
			send("moveplayer", id, info);
		}
	});

	/* move ball */
	socket.on("moveball", function(info) {
		if(game[info.gameid]!=null && game[info.gameid].length > 1) {
			if(game[info.gameid][0] === info.id) {
				id = game[info.gameid][1];
			} else {
				id = game[info.gameid][0];
			}
			send("moveball", id, info);
		}
	});

	/* sync score */
	socket.on("syncScore", function(info) {
		if(game[info.gameid]!=null && game[info.gameid].length > 1) {
			if(game[info.gameid][0] === info.id) {
				id = game[info.gameid][1];
			} else {
				id = game[info.gameid][0];
			}
			send("syncScore", id, info);
		}
	});

	/* Handle client disconnection */
	socket.on("disconnect", function() {
		// Check that the user has already joined successfully
		if (socket.id) {
			delete game[socket.game];						// delete user info from global list
			delete socketPlayers[socket.id];							// delete socket info from global list
			//io.sockets.emit("userDisconnected", socket.user);	// Let all the remaining clients know of the disconnect
		}
	});
});

