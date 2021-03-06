// This is a template for a Node.js scraper on morph.io (https://morph.io)

var cheerio = require("cheerio");
var request = require("request");
var sqlite3 = require("sqlite3").verbose();

//change
function initDatabase(callback) {
	// Set up sqlite database.
	var db = new sqlite3.Database("data.sqlite");
	db.serialize(function() {
		db.run("CREATE TABLE IF NOT EXISTS data (name TEXT, desc TEXT, year INT)");
		callback(db);
	});
}

function updateRow(db, value, desc, year) {
	// Insert some data.
	var statement = db.prepare("INSERT INTO data VALUES (?,?,?)");
	statement.run(value, desc, year);
	statement.finalize();
}

function readRows(db) {
	// Read some data.
	db.each("SELECT rowid AS id, name FROM data", function(err, row) {
		console.log(row.id + ": " + row.name+ ":: " + row.desc+ "::" +row.year);
	});
}

function fetchPage(url, callback) {
	// Use request to read in pages.
	request(url, function (error, response, body) {
		if (error) {
			console.log("Error requesting page: " + error);
			return;
		}

		callback(body);
	});
}

function run(db) {
	// Use request to read in pages.
	console.log("Going to page");
	fetchPage("http://www.australia.gov.au/about-australia/special-dates-and-events/public-holidays", function (body) {
		// Use cheerio to find things in the page with css selectors.
		var $ = cheerio.load(body);

	
	 var act = $('#act');
	 console.log("act element:"+$(act).text().trim());
	 var i = 0;
		var elements = $('li[class=public-holiday]', '.act-2016').each(function () {
			i++;
			var value = $('.holiday-date',this).text().trim();
			var desc = $('.holiday-title',this).text().trim();
			updateRow(db , i+","+value,desc, 2016);
		});
		var act_next = $('li[class=public-holiday]', '.act-2017').each(function () {
			i++;
			var value = $('.holiday-date',this).text().trim();
			var desc = $('.holiday-title',this).text().trim();
			updateRow(db , i+","+value,desc,2017);
		});

		readRows(db);

		db.close();
	});
}

initDatabase(run);
