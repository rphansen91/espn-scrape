var request = require('request');
var cheerio = require('cheerio');
var express = require('express');
var app = express();
var port = 5000;

app.get('/:id/:player', function (req, res) {
	var id = req.params.id;
	var player = req.params.player;
	var url = 'http://espn.go.com/nfl/player/gamelog/_/id/' + id + '/' + player;
	scrape(url, res);
});

function scrape (url, res) {
	var stats = [];
	request(url, function (err, resp, body) {
		if (err) throw err;
		$ = cheerio.load(body);
		$('.tablehead tr').each(function () {
			var stat = [];
			$(this).find('td').each(function () {
				var value = ($(this).text());
				var split = ($(this).attr('colspan'));
				if (split) { stat.push({'val':value,'split':split}); }
				else {stat.push(value);}
			});
			stats.push(stat);
		});
		return normalize(stats, res);
	});
} 

function normalize (data, res) {
	var top = data.splice(0,1);
	var header = data.splice(0,1);
	var cut;
	var i = 0;
	while (!cut) {
		if (typeof data[i][0] != 'string') { cut = i; }
		i++;
	}
	data.splice(cut, data.length);
	var games = [];
	data.forEach(function (dat) {
		var game = {};
		for (var i = 0; i < header[0].length; i++) {
			game[header[0][i]] = dat[i];
		}
		games.push(game);
	});
	var normalized = {
		'stats': top[0],
		'keys': header[0],
		'games': games
	}
	res.json(normalized);
}

app.listen(port, function() {
    console.log("Listening on " + port);
});