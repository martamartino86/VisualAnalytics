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
// var miadata;
// var old_data;
// var datanest;
// var miacountry;
 var param;
// var mybutton;

// funzione che gestisce il line chart.
function linechart(selectedISO) {
	console.log(factor);
	var selectedCountry = "";
	var state = "multiple"; // stato di visualizzazione del chart
	var vis = d3.select("#divchart");

	// imposto attributi del chart che non cambieranno
	var xRange = d3.time.scale()
		.range([MARGIN.left, WIDTH]);
	var yRange = d3.scale.linear()
		.range([HEIGHT - MARGIN.top, MARGIN.bottom]);
	var linefun = d3.svg.line()
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
		console.log(factor);
		var years = [];
		var parseDate = d3.time.format("%Y").parse;
		var i = 0;

		// array degli anni del dataset
		for (var d in data[0]) {
			if (!(isNaN(d)))
				years[i++] = d;
		}

		// creo una struttura dati migliore
		var dataNew = [];
		for (var d in data) {
			if (data[d].iso3 == selectedISO)
				selectedCountry = data[d].Country;
			for (var y in years) {
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
		var data = dataNew;
		//miadata = data; // DEBUG

		data.forEach(function (d){
			d.year = parseDate(d.year);
		});

		xRange.domain(d3.extent(data, function(d) { return d.year; }));

		var max = d3.max(data, function(d) {return d.val;});
		var min = d3.min(data, function(d) {return d.val;});
		var ext = max - min;
		min = min - 0.05;
		max = max + 0.05;
		yRange.domain([min,max]);
		// yRange.domain([
		// 		d3.min(data, function(d) {return d.val;}),
		// 		d3.max(data, function(d) {return d.val;})
		// 	]);
		var xAxis = d3.svg.axis()
			.scale(xRange)
			.ticks(years.length)
			.tickSize(0)
			.innerTickSize(10)
			.tickSubdivide(false);
		var yAxis = d3.svg.axis()
			.scale(yRange)
			.orient("left")
			.tickSize(1)
			.tickSubdivide(true);
	
		var tip = d3.tip()
			.attr('class', 'd3-tip')
			.offset([-10, 0])
			.html(function(d) {
				console("tip:"+d.Country)
				return d.Country;
			});
		

		// raccolgo i dati per Country, perché voglio disegnare una sola linea per Country
		data = d3.nest().key(function(d) { return d.iso; }).entries(data);
		//datanest = data; // DEBUG

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
		var country = vis.selectAll(".country")
			.data(data, function(d) {param = d; return d.key} );

		// aggiorno le linee già esistenti da disegnare
		vis.selectAll("path.line")
			.transition()
			.duration(750)
			.attr("class", "line")
			.attr("d", function(d) {return linefun(d.values); })
			.attr("stroke", function(d) {return setcolor(d.key); })
			.attr("stroke-width", function(d) {return setstroke(d.key); })
			.attr("fill", "none")
			.style("opacity", function(d) {return setopacity(d.key); });

		// disegno le linee: nei country inserisco un path per ogni riga
		var countryEnter = country
			.enter()
			.append("g") // aggiunta
			.attr("class","country")
			.append("path")
			.attr("class", "line")
			.attr("d", function(d) {return linefun(d.values); })
			.attr("stroke", "#2E2E2E")
			.attr("stroke-width", 0)
			.style("opacity", 0)
			.on("mouseover", function(d) {
				// linea over
				var l = d3.select(this)
				l.style("stroke-width","3px")
				// d.key: unico text da mostrare
				var x = "#"+d.key
				vis.select(x)
					.attr("transform", function(d) {
						return "translate(" + xRange(d.values[d.values.length-1].year) + "," + yRange(d.values[d.values.length-1].val) + ")"; })
					.style("visibility", "visible")
					.style("stroke", "#FFFFFF")
			})
			.on("mouseout", function(d) {
				var l = d3.select(this)
				// lo stroke-width cambia in base al Country della line
				l.style("stroke-width",function(d) {return setstroke(d.key) });
				var x = "#"+d.key
				vis.select(x)
					.style("visibility", "hidden")
					.style("stroke", "#FFFFFF")
			});

		countryEnter.transition()
			.duration(750)
			.attr("stroke", function(d) {return setcolor(d.key); })
			.attr("stroke-width", function(d) {return setstroke(d.key); })
			.attr("fill", "none")
			.style("opacity", function(d) {return setopacity(d.key); })
			.style("z-index", function(d) {return zetaindex(d.key); })

		// appendo la stringa relativa al Country selezionato: devo posizionarla in base a x e y del 2013
		vis.selectAll(".country")
			.append("text")
			.attr("id", function(d) {return d.key;})
			.attr("transform", function(d) {
				return "translate(" + xRange(d.values[d.values.length-1].year) + "," + yRange(d.values[d.values.length-1].val) + ")"; })
			.attr("dy", ".15em")
			.attr("text-anchor", "start")
			.style("fill", "red")
			.style("text-decoration", "bold")
			.style("visibility", "hidden")
			.text(function(d) {return d.key;} );


		// rimuovo gli oggetti che non servono per i dati attuali
		country.exit()
			.transition()
			.duration(750)
			.style("opacity",0)
			.remove();
	}
	
	$("#changevisual").click(function (x) {
		var btn = $("#changevisual");
		mybutton = btn; // DEBUG
		if (state === "multiple") {
			state = "single";
			switch (factor) {
				case 'gii':
					dsv("gii_index.csv", function(newdata) {
						var data = findData(newdata);
						createChart(data);
					});
					break;
				case 'health':
					dsv("health_index.csv", function(newdata) {
						var data = findData(newdata);
						createChart(data);
					});
					break;
				case 'empowerment':
					dsv("empowerment_index.csv", function(newdata) {
						var data = findData(newdata);
						createChart(data);
					});
					break;
				case 'labourforce':
					dsv("labourforce_index.csv", function(newdata) {
						var data = findData(newdata);
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
					dsv("gii_index.csv", function(newdata) {
						createChart(newdata);
					});
					break;
				case 'health':
					dsv("health_index.csv", function(newdata) {
						createChart(newdata);
					});
					break;
				case 'empowerment':
					dsv("empowerment_index.csv", function(newdata) {
						createChart(newdata);
					});
					break;
				case 'labourforce':
					dsv("labourforce_index.csv", function(newdata) {
						createChart(newdata);
					});
					break;
			}
			btn.html("Analyze Country trending");
		}
	});

	$("#closechart").click(function(x) {
		// nascondo i div del chart
		d3.select("#containerchart")
			.style("visibility","hidden");
		$('#divchart').html("");
		d3.select("#divchart")
			.style("visibility","hidden");
		// riporto il bottone al valore principale
		$("#changevisual").html("Analyze Country trending");
		// ripulisco il chart
		/*d3.select("#chartTitle")
			.remove();
		d3.select(".xAxis")
			.remove();
		d3.select(".yAxis")
			.remove();
		d3.selectAll("g.country")
			.remove();
		d3.selectAll("path.line")
			.remove();*/
	});

	// UTILITY FUNCTIONS
	findData = function(data) {
		for (var d in data) {
			if (data[d].iso3 === selectedISO)
				return [data[d]];
		}
	}

	matchCountry = function(x, y) {
		return (x === y);
	}

	setcolor = function(d) {
		if (matchCountry(d,selectedISO))
			return "#B20000";
		else
			return "#A2A2A2";
	}

	setstroke = function(d) {
		if (matchCountry(d,selectedISO))
			return 3;
		else
			return 1;
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
			return "selectedCountry";
		else
			return "otherCountry";
	}

	setopacity = function(d) {
		if (matchCountry(d,selectedISO))
			return 1.0;
		else
			return 0.4;
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