var express = require('express');
var app = express();
var http = require('http');
var fs = require('fs');
var bodyParser = require('body-parser');
var cards = require('./libs/cards');

var port = 80;
if(fs.existsSync('port.txt')){
    port = fs.readFileSync('port.txt', 'utf8');
    port = parseInt(port);
}

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.get('/', function(req, res){
	res.sendFile(__dirname + '/public/index.html');
});

app.get('/cards', function(req, res){
    var count = req.query.count || 1;
    count = parseInt(count);
    res.json(cards.getCards(count));
});

var httpServer = http.createServer(app);
httpServer.listen(port);

console.log('server started on ' + port);

var io = require('socket.io')(httpServer);

var scores = {};
app.get('/newsession', function(req, res){
    scores = {};
    io.sockets.emit('scores', {});
    res.redirect('back');
});

io.on('connection', function(client){
    console.log('connected');
    client.on('event', function(data){ console.log("client event"); });
    client.on('disconnect', function(){ console.log("client disconnect"); });

    client.on('text-message', function(msg){
        io.sockets.emit('text-message', msg);
    });

    client.on('score', function(msg){
        if(!(msg.user in scores)){
            scores[msg.user] = 0;
        }
        scores[msg.user] += parseInt(msg.score);

        io.sockets.emit('scores', scores);
    });
});