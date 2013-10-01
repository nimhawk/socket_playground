var socketio = require('socket.io');


module.exports = Sockets;

function Sockets(server) {
  this.clients = {};
  this.socketsOfClients = {};

  this.server = server;
}

Sockets.prototype.init = function () {
  var self = this;


  this.io = socketio.listen(this.server);

  this.io.sockets.on('connection', function (socket) {
    socket.on('set username', function (userName) {
      // Is this an existing user name?
      if (self.clients[userName] === undefined) {
        // Does not exist ... so, proceed
        self.clients[userName] = socket.id;
        self.socketsOfClients[socket.id] = userName;
        self.userNameAvailable(socket.id, userName);
        self.userJoined(userName);
      } else
      if (self.clients[userName] === socket.id) {
        // Ignore for now
      } else {
        self.userNameAlreadyInUse(socket.id, userName);
      }
    });
    socket.on('message', function (msg) {
      var srcUser;
      if (msg.inferSrcUser) {
        // Infer user name based on the socket id
        srcUser = self.socketsOfClients[socket.id];
      } else {
        srcUser = msg.source;
      }

      if (msg.target === "All") {
        // broadcast
        self.io.sockets.emit('message', {
          "source": srcUser,
          "message": msg.message,
          "target": msg.target
        });
      } else {
        // Look up the socket id
        self.io.sockets.sockets[self.clients[msg.target]].emit('message', {
          "source": srcUser,
          "message": msg.message,
          "target": msg.target
        });
      }
    });
    socket.on('disconnect', function () {
      var uName = self.socketsOfClients[socket.id];
      delete self.socketsOfClients[socket.id];
      delete self.clients[uName];

      // relay this message to all the clients

      self.userLeft(uName);
    });
  });
};
Sockets.prototype.userJoined = function (uName) {
  var self = this;
  Object.keys(this.socketsOfClients).forEach(function (sId) {
    self.io.sockets.sockets[sId].emit('userJoined', {
      "userName": uName
    });
  });
}

Sockets.prototype.userLeft = function (uName) {
  this.io.sockets.emit('userLeft', {
    "userName": uName
  });
}

Sockets.prototype.userNameAvailable = function (sId, uName) {
  var self = this;

  setTimeout(function () {

    console.log('Sending welcome msg to ' + uName + ' at ' + sId);
    self.io.sockets.sockets[sId].emit('welcome', {
      "userName": uName,
      "currentUsers": JSON.stringify(Object.keys(self.clients))
    });

  }, 500);
}

Sockets.prototype.userNameAlreadyInUse = function (sId, uName) {
  var self = this;

  setTimeout(function () {
    self.io.sockets.sockets[sId].emit('error', {
      "userNameInUse": true
    });
  }, 500);
}