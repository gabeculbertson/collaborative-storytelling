var express = require('express');
var app = express();
var http = require('http');
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');

var Cards = require('./libs/cards');
var makeId = require('./libs/make-id');

var port = 80;
if(fs.existsSync('port.txt')){
    port = fs.readFileSync('port.txt', 'utf8');
    port = parseInt(port);
}

var httpServer = http.createServer(app);
httpServer.listen(port);

console.log('server started on ' + port);

var io = require('socket.io')(httpServer);

var games = {};

app.set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')
    .use(express.static(__dirname + '/public'))
    .use(bodyParser.json())
    .use(bodyParser.urlencoded())
    // data files and commands
    .get('/api/cards', function(req, res){
        res.json(Cards.getCards());
    })
    .get('/api/game', function(req, res){

    })
    .get('/api/games', function(req, res){
        res.json(games);
    })
    .get('/api/newgame', function(req, res){
        var gameId = makeId();
        var cards = Cards.getCards();
        Cards.shuffle(cards);

        games[gameId] = {
            cards: cards
        };
        res.send(gameId);
    })
    .get('/api/endgame', function(req, res){
        var gameId = req.query.gameId;
        if(game in games){
            delete games[gameId];
        }
        res.redirect('back');
    })
    // webpages 
    .get('/', function(req, res){
        res.redirect('/games');
    })
    .get('/game', function(req, res){
        res.render('game', { gameId: req.query.gameId });
    })
    .get('/games', function(req, res){
        res.render('games', { games: games });
    });

io.on('connection', function(client){
    console.log('connected');
    client.on('event', function(data){ console.log("client event"); });
    client.on('disconnect', function(){ console.log("client disconnect"); });

    client.on('set-game', function(game){
        client.join(game);

        client.emit('joined');

        client.on('text-message', function(msg){
            if(game in games){
                io.to(game).emit('text-message', msg);
            } else{
                io.to(game).emit('text-message', "<span style='color:red'>ERROR: The game has ended or is invalid.<span>");
            }
        });

        client.on('draw-language-card', function(){
            if(game in games){
                var card = games[game].cards.languageCards.pop();
                client.emit('language-card', card);
            } else{
                io.to(game).emit('text-message', "<span style='color:red'>ERROR: The game has ended or is invalid.<span>");
            }
        });
    });
});