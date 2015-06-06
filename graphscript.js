var factor = "health"; // 						<--------------- MODIFICA PER TEST
var selectedISO = "ITA";
var dsv = d3.dsv(";", "text/plain"); //		<<<--- GIA' PRESENTE NEL FILE projectscript.js
var linefun;

// debug stuff:
var miadata;
var old_data;
var datanest;
var miacountry;
var param;

$("document").ready(function(){
	// CREAZIONE AMBIENTE SVG
	// var svg = d3.select("#chartContainer").append("svg")
	// 	.attr("width", "700")
	// 	.attr("height", "500")
	// 	.attr("viewBox", "0 0 700 500");

	// var mainRect = svg.append("rect")
	//    .attr("x",0)
	//    .attr("y",0)
	//    .attr("width",700)
	//    .attr("height",500)
	//    .attr("fill", "none")
	//    .attr("stroke", "grey")
	//    .attr("stroke-width", 1)
	
	switch (factor) {
		case 'gii':
			dsv("gii_index.csv", function(data) {
				show_factor(data);
			});
			break;
		case 'health':
			dsv("health_index.csv", function(data) {
				show_factor(data);
			});
			break;
		case 'empowerment':

			break;
		case 'labourforce':

			break;
	}

	function show_factor(data) {
		var years = [];
		var parseDate = d3.time.format("%Y").parse;
		var i = 0;

		// array degli anni del dataset
		for (d in data[0]) {
			if (!(isNaN(d)))
				years[i++] = d;
		}

		old_data = data; // DEBUG

		// creo una struttura dati migliore
		dataNew = [];
		for (d in data) {
			for (y in years) {
				dataNew.push({
					iso: data[d].iso3,
					Country: data[d].Country,
					year: years[y],
					val: parseFloat(data[d][years[y]])
				});
			}
		}
		data = dataNew;

		miadata = data; // DEBUG
		//pos = searchCountry(geography,data);
		// if (pos == -1) {
		// 	$("#dialog").append(geography.properties.name+"\'s data are not available.")
		// 	return;
		// }

		// var d = data[pos]; // riga di dati da visualizzare
		// var svg = $("#dialog").append('svg')
		// 	.attr('width', "100%")
		// 	.attr('height', "100%");
		var vis = d3.select("#chartContainer"),
			WIDTH = 800,
			HEIGHT = 500,
			MARGIN = {
				top: 20,
				right: 20,
				bottom: 20,
				left: 60
			};
			data.forEach(function (d){
				d.year = parseDate(d.year);
			});
			// il range per l'asse x va dal min_anno al max_anno, e va mappato su una retta lunga da 0 a width
			xRange = d3.time.scale()
				.domain(d3.extent(data, function(d) { return d.year; }))
				.range([MARGIN.left, WIDTH]),
			yRange = d3.scale.linear()
				.domain([
					d3.min(data, function(d) {return d.val;}),
					d3.max(data, function(d) {return d.val;})
				])
				.range([HEIGHT - MARGIN.top, MARGIN.bottom]),

			xAxis = d3.svg.axis()
				.scale(xRange)
				//.tickValues(years)
				.ticks(years.length)
				.tickSize(1)
				.tickSubdivide(true),
			yAxis = d3.svg.axis()
				.scale(yRange)
				.orient("left")
				.tickSize(1)
				.tickSubdivide(true);
		
		linefun = d3.svg.line()
			.x(function(d) {
				return xRange(d.year);
			})
			.y(function(d) {
				return yRange(d.val);
			})
			.interpolate("basic");

		// raccolgo i dati per Country, perché voglio disegnare una sola linea per Country
		//data = d3.nest().key(function(d) { return d.Country; }).entries(data);
		data = d3.nest().key(function(d) { return d.iso; }).entries(data);
		datanest = data; // DEBUG

		vis.append("svg:g")
			.attr("class", "xAxis")
			.attr("transform", "translate(0," + (HEIGHT - MARGIN.bottom) + ")")
			.call(xAxis);

		vis.append("svg:g")
			.attr("class", "yAxis")
			.attr("transform", "translate(" + (MARGIN.left) + ",0)")
			.call(yAxis)
			.append("text")
				.attr("transform", "translate(30, 10)")
				.attr("dy", ".60em")
				.style("text-anchor", "end")
				.style("font-weight", "bold")
				.text(factor+" index");

		// creo i Paesi per collegarci una line ciascuno
		var country = vis.selectAll(".country")
			.data(data)
			.enter()
			.append("g")
				.attr("class", "country");
		
		miacountry = country; // DEBUG
		
		matchCountry = function(x, y) {
			return x === y;
		}

		colorfun = function(d) {
			if (matchCountry(d,selectedISO))
				return "red";
			else
				return "grey";
		}

		visibilitytext = function(d) {
			if (matchCountry(d,selectedISO))
				return "visible";
			else
				return "hidden";
		}

		zetaindex = function(d) {
			if (matchCountry(d,selectedISO))
				return 2000;
			else
				return -1;
		}

		createid = function(d) {
			if (matchCountry(d,selectedISO))
				return "#selectedCountry";
			else
				return "#otherCountry";
		}
		// disegno le linee: nei country inserisco un path per ogni riga (il bind con data l'ho fatto sopra)
		country.append("path")
			.attr("class", "line")
			.attr("d", function(d) {return linefun(d.values); })
			.attr("id", function(d) {return createid(d.values); })
			.attr("stroke", function(d) {return colorfun(d.key); })
			.attr("stroke-width", 1)
			.attr("fill", "none")
			.style("z-index", function(d) {return zetaindex(d.key); })
			.on("mouseover", function(d) {
				param = d;
				d3.select(this)
					.attr("stroke-width", 5)
					.attr("z-index", 2000);
			})
			.on("mouseout", function(d) {
				d3.select(this)
					.attr("stroke-width", 1)
					.attr("z-index", -1)
			});
		
		// voglio stampare la stringa relativa al Country selezionato: devo posizionarla in base a x e y del 2013
		country.append("text")
			.attr("transform", function(d) { return "translate(" + xRange(d.values[d.values.length-1].year) + "," + yRange(d.values[d.values.length-1].val) + ")"; })
			.attr("dy", ".15em")
			.attr("text-color", "black")
			.style("visibility", function(d) { return visibilitytext(d.key); })
			.text(function(d) {return d.key;} );

		// on MOUSE OUT
		function mouseout(d) {
		}
	}
	
});