var fs = require('fs');

var cards = [];
var cards = fs.readFileSync('./cards.txt', 'utf8').split('\n');
for(var i in cards){
	var split = cards[i].split(';');
	cards[i] = { text: split[0], score: split[1] };
}

module.exports.getCards = function (count){
	var cardSet = {};
	var added = 0;
	while(added < count){
		var i = Math.floor(Math.random() * cards.length);
		if(cards[i].text in cardSet){
			continue;
		}
		cardSet[cards[i].text] = cards[i];
		added++;
	}

	var outCards = [];
	for(var key in cardSet){
		outCards.push(cardSet[key]);
	}
	return outCards;
}