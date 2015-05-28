var map;
var colormap;
var d1 = {}, d2 = {};

$("document").ready(function(){
	// CREAZIONE CANVAS SVG
	/*
	var svg = d3.select("body").append("svg")
		.attr("width", 800)
		.attr("height", 600)
		.attr("viewBox", "0 0 800 600");

	// RETTANGOLO DI VISUALIZZAZIONE
	var mainRect = svg.append("rect")
	   .attr("x",0)
	   .attr("y",0)
	   .attr("width",800)
	   .attr("height",600)
	   .attr("fill", "none")
	   .attr("stroke", "black")
	   .attr("stroke-width", 1);
	*/
	var width = document.getElementById('container').offsetWidth;
	var height = document.getElementById('container').offsetHeight;
	var dsv = d3.dsv(";", "text/plain");
	// MAPPA INIZIALE: GII
	dsv("gii_index.csv", function(data){
		colormap = d3.scale.linear()
						.domain([0, 1000])
						.range(["#E0FAFF", "#0099FF"]);
		for (d in data) {
            a = data[d].iso3;
            b = parseFloat(data[d].GII2013.replace(',','.'));
            //console.log(colormap(Math.round(1000*b)));
            d1[a] = colormap(Math.round(1000*b));
            d2[a] = {fillKey: a}
		}
		map = new Datamap({
			element: document.getElementById('container'),
			dataType: 'csv',
			defaultFill: '#FF0000',
			fills: d1,
			data: d2,
			projection: "mercator",
			geographyConfig: {
				borderColor: '#CCCCCC'
			}
		});
		/*
		fills: {
			'ITA__': '#ff0000'
		},
		data: {
			'ITA': {fillKey: 'ITA__'}
		}
		*/		
	});


	$("#health_btn").click(function(){
		d1 = {};
		// implementare enter() dataset con dati health
		dsv("health_index.csv", function(data){
			var max_dataset = d3.max(data, function(d){return parseFloat(d.HLT2013);});
			var min_dataset = d3.min(data, function(d){
				q = parseFloat(d.HLT2013);
				if (q == -1) return max_dataset+1;
				else return q;
			});
			console.log("min: "+min_dataset+" max: "+max_dataset);
			colormap = d3.scale.log()
							.domain([300, 400, 500, 510, 520, 530, 540, 550, 560, 600, 700, max_dataset*1000])
							.range(["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"]);
			for (d in data) {
	            a = data[d].iso3;					// Paese
	            b = parseFloat(data[d].HLT2013);	// valore health 2013
	            d1[a] = colormap(Math.round(1000*b));
	         //    if (b == -1)
	         //    	d1[a] = "CCCCCC";
		        // else if (min_dataset <= b && b < 450)
		        // 	d1[a] = "dark blue"
		        // else if (450 <= b && b < 460)
		        // 	d1[a] = "blue"
		        // else if (460 <= b && b < 500)
		        // 	d1[a] = "violet"
		        // else if (500 <= b && b < 510)
		        // 	d1[a] = "dark red"
		        // else if (510 <= b && b < 520)
		        // 	d1[a] = "red"
		        // else if (520 <= b && b < 530)
		        // 	d1[a] = "light red"
		        // else if ()
			}
			map.updateChoropleth(d1);
		})

	});
	$("#empow_btn").click(function(){
		// implementare enter() dataset con dati empowerment
	});
	$("#lfpr_btn").click(function(){
		// implementare enter() dataset con dati labour force participation rate
	});
		/*
			.append("rect")
			.attr("x", 10)
			.attr("y", function(d,i) {return 35*i;})
			.attr("width", 25)
			.attr("height", 25)
			.attr("fill", "white")
			.attr("stroke", "black")
			.append("text")
			.text(function (d) {return d.iso3;});

	
	for(var prop in gii_index) {
    if(gii_index.hasOwnProperty(prop)) {
    	console.log(gii_index[prop]);
        if(gii_index[prop] === "iso3") {
        	alert (gii_index[prop]);
        }
    }
    */
});