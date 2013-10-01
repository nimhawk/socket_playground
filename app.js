/**
 * Module dependencies.
 */

var express = require('express');
var index = require('./routes/index');
var chat = require('./routes/chat');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var Sockets = require('./sockets');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'hjs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}



app.get('/', index.index);
app.get('/users', user.list);
app.get('/chat', chat.index);

var server = app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});

var s = new Sockets(server);
s.init();