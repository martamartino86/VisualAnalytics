// chart constants
WIDTH = 870;
HEIGHT = 450;
MARGIN = {
	top: 20,
	right: 20,
	bottom: 20,
	left: 60
};
EXIT_TRANSITION_DELAY = 500;
TRANSITION_DURATION = 750;

// debug stuff:
// var miadata;
// var old_data;
// var datanest;
// var miacountry;
//  var param;
//  var mycircle;
// var mybutton;

// funzione che gestisce il line chart.
function linechart(selectedISO) {
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
			if (data[d].iso3 == selectedISO) {
				// selectedCountry: variabile di comodo per tenermi il nome del Country selezionato
				selectedCountry = data[d].Country;
				console.log("Ho trovato il Paese selezionato: "+selectedISO+ " "+selectedCountry);
				var count = 0;
				for (var y in years) {
					var v = (data[d][years[y]]).replace(',','.');
					if (v != -1)
						dataNew.push({
							iso: data[d].iso3,
							Country: data[d].Country,
							year: years[y],
							val: parseFloat(v)
					});
					else count++;
				}
				if (count === years.length) {
					console.log(selectedCountry+" ha "+count+" valori a -1.")
					vis.append("text")
						.attr("id", "chartTitle")
				        .attr("x", (WIDTH / 2))             
				        .attr("y", 0 - (MARGIN.top / 2) + 35)
				        .attr("text-anchor", "middle")  
				        .style("font-size", "16px") 
				        .text(selectedCountry + "'s " + factor + " data not available.");
				    $('#changevisual').attr("disabled", true);
					return;
				    }
			}
			else {
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
		}
		var data = dataNew;
		//miadata = data; // DEBUG

		data.forEach(function (d){
			d.year = parseDate(d.year);
		});

		xRange.domain(d3.extent(data, function(d) { return d.year; }));
		yRange.domain([d3.min(data, function(d) {return d.val;}) - 0.05, d3.max(data, function(d) {return d.val;}) + 0.05]);
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

		// raccolgo i dati per Country, perché voglio disegnare una sola linea per Country
		data = d3.nest().key(function(d) { return d.iso; }).entries(data);
		//datanest = data; // DEBUG
		assey = yAxis;
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
				.duration(TRANSITION_DURATION)
				.call(xAxis);
			vis.select(".yAxis")
				.transition()
				.duration(TRANSITION_DURATION)
				.call(yAxis);
		}
		// titolo del grafico
		if ($("#chartTitle").text().trim().length === 0) {
			vis.append("text")
				.attr("id", "chartTitle")
		        .attr("x", (WIDTH / 2))             
		        .attr("y", 0 - (MARGIN.top / 2) + 35)
		        .attr("text-anchor", "middle")  
		        .style("font-size", "16px") 
		        .text(selectedCountry + " - " + factor + " index");
		   }

		// bindo i dati
		var country = vis.selectAll(".country")
			.data(data, function(d) {return d.key} );

		// EXIT: rimuovo gli oggetti che non servono per i dati attuali (con transizione)
		country.exit()
			.transition()
			.duration(EXIT_TRANSITION_DELAY)
			.style("opacity",1e-6)
			.remove();

		// se sto visualizzando tutte le righe, cancello gli eventuali circle creati precedentemente
		if (state === "multiple") {
			country.selectAll(".cerchi")
				.transition()
				.delay(EXIT_TRANSITION_DELAY)
				.duration(TRANSITION_DURATION)
				.style("opacity", 1e-6)
		}
		// solo se sto visualizzando un'unica riga, devo creare i cerchietti coi valori
		else if (state === "single") {
			country.selectAll(".cerchi")
				.transition()
				.delay(EXIT_TRANSITION_DELAY)
				.duration(TRANSITION_DURATION)
				.style("opacity",1);
			country.selectAll(".point")
				.data(function (d) {return d.values;})
				.enter()
				.append("g")
					.attr("class","cerchi")
				.append("circle")
					.attr("class","point")
					.attr("cx", function(d) {return xRange(d.year); })
					.attr("cy", function(d) {return yRange(d.val); })
					.attr("r", "5px")
					.style("fill", "#FFFF00")
					.style("visibility","visible")
			if ($(".cerchi").text().trim().length === 0) {
				country.selectAll(".cerchi")
					.append("text")
					.attr("x", function(d) {return xRange(d.year);} )
					.attr("y", function(d) {return (yRange(d.val) - 7);} )
					.style("font-size","10px")
					.text(function(d) {return d.val;});
			}
		}

		// UPDATE: aggiorno le linee già esistenti da disegnare (che poi sarebbe l'unica rossa...)
		var countryUpdate = vis.selectAll("path.line")
			.transition()
			.delay(EXIT_TRANSITION_DELAY)
			.duration(TRANSITION_DURATION)
			.attr("class", "line")
			.attr("d", function(d) {return linefun(d.values); })
			// .attr("stroke", function(d) {return setcolor(d.key); })
			// .attr("stroke-width", function(d) {return setstroke(d.key); })
			// .attr("fill", "none")
			// .style("opacity", function(d) {return setopacity(d.key); });

		// ENTER: disegno le linee: nei country inserisco un path per ogni riga
		var countryEnter = country
			.enter()
			.append("g") // aggiunta
				.attr("class","country")
			.append("path")
				.attr("class", "line")
				.attr("d", function(d) {return linefun(d.values); })
				.attr("stroke", "#2E2E2E")
				.attr("stroke-width", 0)
				.style("opacity", 1e-6)
				.on("mouseover", function(d) {
					var coordinates = d3.mouse(this);
					// linea over
					var l = d3.select(this)
					l.style("stroke-width","3px")
					// d.key: unico text da mostrare
					var x = "#"+d.key
					vis.select(x)
						.attr("transform", function(d) {
							return "translate(" + xRange(d.values[d.values.length-1].year) + "," + yRange(d.values[d.values.length-1].val) + ")"; })
						.style("visibility", "visible")
						.style("stroke", "#2E2E2E")
				})
				.on("mouseout", function(d) {
					var l = d3.select(this)
					// lo stroke-width cambia in base al Country della line
					l.style("stroke-width",function(d) {return setstroke(d.key) });
					var x = "#"+d.key
					vis.select(x)
						.style("visibility", "hidden")
						.style("stroke", "#2E2E2E")
				});

		// TRANSITION delle linee in ingresso (è qui che setto colore/stroke/ecc. che avranno una volta apparse)
		countryEnter.transition()
			.delay(EXIT_TRANSITION_DELAY)
			.duration(TRANSITION_DURATION)
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
			.style("visibility", "hidden")
			.text(function(d) {return d.key;} );

	}
	
	$("#changevisual").click(function (x) {
		console.log("CLICK!")
		var btn = $("#changevisual");
		//mybutton = btn; // DEBUG
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
		$('#changevisual').attr("disabled", false);
		$("#changevisual").off("click");
		// ripulisco il chart
		d3.select("#chartTitle")
			.remove();
		d3.select(".xAxis")
			.remove();
		d3.select(".yAxis")
			.remove();
		d3.selectAll("g.country")
			.remove();
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
