var fs = require('fs');
var shuffle = require('shuffle-array');

function getLanguageCards(){
	var cards = [];
	var lines = fs.readFileSync('./resources/language-cards.txt', 'utf8').split('\n');
	for(var i in lines){
		var split = lines[i].split('\t');
		if(split.length < 3) continue;

		var count = parseInt(split[2]);
		for(var j = 0; j < count; j++){
			cards.push({ text: split[0], score: split[1] });
		}
	}
	return cards;
}


function getActionCards(){
	var cards = [];
	var lines = fs.readFileSync('./resources/action-cards.txt', 'utf8').split('\n');
	for(var i in lines){
		var split = lines[i].split('\t');
		cards.push({ text: split[0], action: split[1] });
	}
	return cards;
}

module.exports.getCards = function (){
	return {
		languageCards: getLanguageCards(),
		actionCards: getActionCards()
	};
}

module.exports.shuffle = function (cards){
	shuffle(cards.languageCards);
	shuffle(cards.actionCards);
}