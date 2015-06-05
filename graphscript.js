var factor = "gii"; // 						<--------------- MODIFICA PER TEST
var pos = 82; // ITALIA
var dsv = d3.dsv(";", "text/plain"); //		<<<--- GIA' PRESENTE NEL FILE projectscript.js
var miadata;
var linefunction;

var plot;

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
	//    .attr("stroke-width", 1);


	
	switch (factor) {
		case 'gii':
			dsv("gii_index.csv", function(data) {
				var years = [], max_years = [];
				var parseDate = d3.time.format("%Y").parse;
				var i = 0;
				miadata = data; // DEBUG

				// array degli anni del dataset
				for (d in data[0]) {
					if (!(isNaN(d)))
						years[i++] = d;
				}

				// calcolo il max per ogni anno
				// for (y in years)
				// 	max_years[y] = d3.max(data, function(d) {return d[years[y]]});
				// max_gii = d3.max(max_years, function(d) {return d;});

				dataNew = [];
				for (d in data) {
					for (y in years) {
						dataNew.push({
							iso: data[d].iso3,
							Country: data[d].Country,
							year: years[y],
							val: data[d][years[y]]
						});
					}
				}
				data = dataNew;
				miadata = data;

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
						left: 50
					};
					data.forEach(function (d){
						d.year = parseDate(d.year);
					});
					// il range per l'asse x va dal min_anno al max_anno, e va mappato su una retta lunga da 0 a width
					xRange = d3.time.scale()
						.domain(d3.extent(data, function(d) { return d.year; }))
						.range([MARGIN.left +1, WIDTH]),
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
						.tickSize(2)
						.tickSubdivide(true),
					yAxis = d3.svg.axis()
						.scale(yRange)
						.orient("left")
						.tickSize(2)
						.tickSubdivide(true);
				
				vis.append("svg:g")
					.attr("class", "xAxis")
					.attr("transform", "translate(0," + (HEIGHT - MARGIN.bottom) + ")")
					.call(xAxis);

				vis.append("svg:g")
					.attr("class", "yAxis")
					.attr("transform", "translate(" + (MARGIN.left) + ",0)")
					.call(yAxis)
					.append("text")
						.attr("transform", "translate(10, 10)")
						.attr("dy", ".60em")
						.style("text-anchor", "end")
						.style("font-weight", "bold")
						.text("GII index");

				linefunction = d3.svg.line()
					.x(function(d) {
						return xRange(d.year);
					})
					.y(function(d) {
						return yRange(d.val);
					});

				vis.append("path")
					.attr("d", linefunction(data))
					.attr("stroke", "grey")
					.attr("stroke-width", 1)
					.attr("fill", "none");

				vis.selectAll("path")
					.data(data)
					.enter()
					.append("circle")
						.attr("r", 1.5)
						.style("fill", "black")
						.attr("cx", function(d) { return xRange(d.year); })
						.attr("cy", function(d) { return yRange(d.val); } );
			});
			break;
		case 'health':

			break;
		case 'empowerment':

			break;
		case 'labourforce':

			break;
	}
	
});