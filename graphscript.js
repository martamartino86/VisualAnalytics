var selectedCountry = ""; // serve qui, globale
var dsv = d3.dsv(";", "text/plain"); //		<<<--- GIA' PRESENTE NEL FILE projectscript.js

// chart constants
WIDTH = 870;
HEIGHT = 450;
MARGIN = {
	top: 20,
	right: 20,
	bottom: 20,
	left: 60
};

// debug stuff:
var miadata;
var old_data;
var datanest;
var miacountry;
var param;
var mybutton;

// funzione che gestisce il line chart.
function linechart(factor, selectedISO) {
	var state = "multiple"; // stato di visualizzazione del chart
	var vis = d3.select("#divchart");

	// imposto attributi del chart che non cambieranno
	xRange = d3.time.scale()
		.range([MARGIN.left, WIDTH]);
	yRange = d3.scale.linear()
		.range([HEIGHT - MARGIN.top, MARGIN.bottom]);
	linefun = d3.svg.line()
	.x(function(d) {
		return xRange(d.year);
	})
	.y(function(d) {
		return yRange(d.val);
	})
	.interpolate("linear");

	// switcho sul fattore e costruisco il grafico in base ai dati che ho.
	switch (factor) {
		case 'gii':
			dsv("gii_index.csv", function(data) {
				createChart(data);
			});
			break;
		case 'health':
			dsv("health_index.csv", function(data) {
				createChart(data);
			});
			break;
		case 'empowerment':
			dsv("empowerment_index.csv", function(data) {
				createChart(data);
			});
			break;
		case 'labourforce':
			dsv("labourforce_index.csv", function(data) {
				createChart(data);
			});
			break;
	}

	function createChart(data) {
		var years = [];
		var parseDate = d3.time.format("%Y").parse;
		var i = 0;

		// array degli anni del dataset
		for (d in data[0]) {
			if (!(isNaN(d)))
				years[i++] = d;
		}

		// creo una struttura dati migliore
		dataNew = [];
		for (d in data) {
			if (data[d].iso3 == selectedISO)
				selectedCountry = data[d].Country;
			for (y in years) {
				var v = (data[d][years[y]]).replace(',','.');
				if (v != -1)
					dataNew.push({
						iso: data[d].iso3,
						Country: data[d].Country,
						year: years[y],
						val: parseFloat(v)
				});
			}
		}
		data = dataNew;
		miadata = data; // DEBUG

		data.forEach(function (d){
			d.year = parseDate(d.year);
		});
		// mappo i min&max del dataset sugli assi
		xRange.domain(d3.extent(data, function(d) { return d.year; }));
		yRange.domain([
				d3.min(data, function(d) {return d.val;}),
				d3.max(data, function(d) {return d.val;})
			]);
		xAxis = d3.svg.axis()
			.scale(xRange)
			//.tickValues(years)
			.ticks(years.length)
			.tickSize(1)
			.tickSubdivide(true);
		yAxis = d3.svg.axis()
			.scale(yRange)
			.orient("left")
			.tickSize(1)
			.tickSubdivide(true);

		// raccolgo i dati per Country, perché voglio disegnare una sola linea per Country
		data = d3.nest().key(function(d) { return d.iso; }).entries(data);
		datanest = data; // DEBUG

		// se gli assi non esistono li appendo, altrimenti li aggiorno
		if (vis.selectAll(".yAxis")[0].length === 0){
		    // appendo gli assi
			vis.append("svg:g")
				.attr("class", "xAxis")
				.attr("transform", "translate(0," + (HEIGHT - MARGIN.bottom) + ")")
				.call(xAxis);
			vis.append("svg:g")
				.attr("class", "yAxis")
				.attr("transform", "translate(" + (MARGIN.left) + ",0)")
				.call(yAxis)
		}
		else {
			vis.select(".xAxis")
				.transition()
				.duration(750)
				.call(xAxis);
			vis.select(".yAxis")
				.transition()
				.duration(750)
				.call(yAxis);
		}
		// titolo del grafico
		if ($("#chartTitle").text().trim().length === 0) {
			vis.append("text")
				.attr("id", "chartTitle")
		        .attr("x", (WIDTH / 2))             
		        .attr("y", 0 - (MARGIN.top / 2))
		        .attr("text-anchor", "middle")  
		        .style("color", "#FFFFFF") 
		        .style("font-size", "16px") 
		        .style("text-decoration", "bold")
		        .text(selectedCountry + " - " + factor + " index");
		   }

		// bindo i dati
		var countryUpdate = vis.selectAll(".line")
			.data(data, function(d) {return d.key} );
		// countryUpdate
		// 	.append("g")
		// 		.attr("class", "country");
		countryUpdate.transition()
			.duration(750)
			.attr("class", "line")
			.attr("d", function(d) {return linefun(d.values); })
			.attr("id", function(d) {return createid(d.key); })
			.attr("stroke", function(d) {return colorfun(d.key); })
			.attr("stroke-width", 1)
			.attr("fill", "none");
		// disegno le linee: nei country inserisco un path per ogni riga
		countryUpdate.enter()
			.append("path")
			.attr("class", "line")
			.attr("d", function(d) {return linefun(d.values); })
			.attr("id", function(d) {return createid(d.key); })
			.attr("stroke", function(d) {return colorfun(d.key); })
			.attr("stroke-width", 1)
			.attr("fill", "none")
			.style("opacity", 1) //function(d) {return setopacity(d.key); })
			//.style("z-index", function(d) {return zetaindex(d.key); })
			.on("mouseover", function(d) {
				vis.selectAll(".line")
					.style("opacity", 0.1);
				d3.select(this)
					.attr("stroke-width", 3)
					.attr("z-index", 2000)
					.style("opacity", 1);
			})
			.on("mouseout", function(d) {
				var line = d3.select(this)
				vis.selectAll(".line")
					.style("opacity", 1.0);
				line.attr("stroke-width", 1)
					.attr("z-index", -1)
					.style("opacity", 1.0);
				// div.style("opacity", 0.0)
				// 	.text("");
			});
		
		// voglio stampare la stringa relativa al Country selezionato: devo posizionarla in base a x e y del 2013
		countryUpdate.append("text")
			.attr("transform", function(d) { return "translate(" + xRange(d.values[d.values.length-1].year) + "," + yRange(d.values[d.values.length-1].val) + ")"; })
			.attr("dy", ".15em")
			.attr("text-color", "red")
			.style("text-decoration", "bold")
			.style("visibility", function(d) { return visibilitytext(d.key); })
			.text(function(d) {return d.key;} );
		// rimuovo gli oggetti che non servono per i dati attuali
		countryUpdate.exit()
			.remove();
	}
	
	$("#changevisual").click(function (x) {
		var btn = $("#changevisual");
		mybutton = btn; // DEBUG
		if (state === "multiple") {
			state = "single";
			switch (factor) {
				case 'gii':
					dsv("gii_index.csv", function(data) {
						data = findData(data);
						createChart(data);
					});
					break;
				case 'health':
					dsv("health_index.csv", function(data) {
						data = findData(data);
						createChart(data);
					});
					break;
				case 'empowerment':
					dsv("empowerment_index.csv", function(data) {
						data = findData(data);
						createChart(data);
					});
					break;
				case 'labourforce':
					dsv("labourforce_index.csv", function(data) {
						data = findData(data);
						createChart(data);
					});
					break;
			}
			btn.html("Compare with other Countries");
		}
		else if (state === "single") {
			state = "multiple";
			switch (factor) {
				case 'gii':
					dsv("gii_index.csv", function(data) {
						createChart(data);
					});
					break;
				case 'health':
					dsv("health_index.csv", function(data) {
						createChart(data);
					});
					break;
				case 'empowerment':
					dsv("empowerment_index.csv", function(data) {
						createChart(data);
					});
					break;
				case 'labourforce':
					dsv("labourforce_index.csv", function(data) {
						createChart(data);
					});
					break;
			}
			btn.html("Analyze trending");
		}
	});

	$("#closechart").click(function(x) {
		// nascondo i div del chart
		d3.select("#containerchart")
			.style("visibility","hidden");
		d3.select("#divchart")
			.style("visibility","hidden");
		// riporto il bottone al valore principale
		$("#changevisual").html("Analyze trending");
		// ripulisco il chart
		d3.select("#chartTitle")
			.remove();
		d3.select(".xAxis")
			.remove();
		d3.select(".yAxis")
			.remove();
		d3.selectAll(".line")
			.remove();
	})

	// UTILITY FUNCTIONS
	findData = function(data) {
		for (d in data) {
			if (data[d].iso3 === selectedISO)
				return [data[d]];
		}
	}

	matchCountry = function(x, y) {
		return (x === y);
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

	// zetaindex = function(d) {
	// 	if (matchCountry(d,selectedISO))
	// 		return 2000;
	// 	else
	// 		return -1;
	// }

	createid = function(d) {
		if (matchCountry(d,selectedISO))
			return "selectedCountry";
		else
			return "otherCountry";
	}

	setopacity = function(d) {
		if (matchCountry(d,selectedISO))
			return 1.0;
		else
			return 0.5;
	}
}
//});


		// // creo il div che servirà per i tooltip
		// var div = d3.select("body")
		// 	.append("div")
		// 	.attr("class", "tooltip")
		// 	.attr("width", "100")
		// 	.attr("position", "absolute")
		// 	.attr("text-align", "center")
		// 	.attr("visibility", "visible")
		// 	.style("opacity", 0.0)
		// 	.style("background-color", "yellow")
		// 	.style("border", "1px dotted black");