var map = null;
var colormap;
var d1 = {}, d2 = {};
var factor;
var dsv = d3.dsv(";", "text/plain");
var miageografia;	// TEST
var miadata;		// TEST

function get_GII_data(data) {
	colormap = d3.scale.linear()
						.domain([0, 1000])
						.range(["#FFE8F6", "#AD3D7E"]);
	for (d in data) {
        a = data[d].iso3;										// ISO3
        b = parseFloat(data[d].GII2013.replace(',','.'));
        //console.log(colormap(Math.round(1000*b)));
        if (b == -1.0)
        	d1[a] = "#A1A1A1"
        else
        	d1[a] = colormap(Math.round(1000*b));				// dizionario 1: ISO3 -> colore
        //d2[a] = {fillKey: a}									// dizionario 2: ISO3 -> fillkey: ISO3
        d2[a] = {fillkey: a, GII2013: b};
	}
	d1.defaultFill = '#A1A1A1';
	return [d1, d2];
}

function initiate_map() {
	console.log("initiate_map");									// get GII data and build map object
	dsv("gii_index.csv", function(data){
		var dict = get_GII_data(data);
		map = new Datamap({											// CREAZIONE MAPPA
			element: document.getElementById('container'),
			geographyConfig: {
				highlightBorderColor: '#bada55',
				popupTemplate: function(geography, data) {
					for (d in data) {
						if (data.fillkey == geography.id) {
							return '<div class="hoverinfo" style="font-weight:bold; text-align: center">' + geography.properties.name + ' <br> GII2013: ' + data.GII2013 + ' '
						}
					}
					return '<div class="hoverinfo" style="font-style:italic">' + geography.properties.name + '\'s data not available'
				},
				highlightBorderWidth: 3,
				highlightFillColor: '#E3E3E3',
				borderColor: '#CCCCCC'
			},
			dataType: 'csv',
			fills: dict[0], //d1,
			data: dict[1],  //d2,
			projection: "mercator",
			done: function (datamap){
				datamap.svg.selectAll('.datamaps-subunit')
					.on('click',function(geography){									// evento CLICK MAPPA: nuova finestra con dati temporali del factor
						console.log(geography);

				});
				datamap.svg.call(d3.behavior.zoom().on("zoom", redraw));				// ZOOM rotella v double click
	            function redraw() {
	            	datamap.svg.selectAll("g").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	            	console.log("[ZOOM] translate: "+d3.event.translate+"; scale: "+d3.event.scale);
	            }
			}
		});
	});
	
}

function show_gii() {
	console.log("show gii");
	dsv("gii_index.csv", function(data){
		var c = get_GII_data(data);
		map.updateChoropleth(c[0]); //d1
		console.log("modificato");
	});
}

$("document").ready(function(){
	var width = document.getElementById('container').offsetWidth;
	var height = document.getElementById('container').offsetHeight;
	// MAPPA INIZIALE: GII
	initiate_map();
	show_gii();
	$("input:radio[value='gii']").change(function() {
		factor = "gii";
		show_gii();
	});
	$("input:radio[value='health']").change(function(){
		// implementare enter() dataset con dati health
		factor = "health";
		dsv("health_index.csv", function(data){
			var max_dataset = d3.max(data, function(d){return parseFloat(d.HLT2013);});
			var min_dataset = d3.min(data, function(d){
				q = parseFloat(d.HLT2013);
				if (q == -1) return max_dataset+1;
				else return q;
			});
			//console.log("min: "+min_dataset+" max: "+max_dataset);
			colormap = d3.scale.log()
							.domain([300, 400, 500, 510, 520, 530, 540, 550, 560, 600, 700, max_dataset*1000])
							.range(["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"]);
			for (d in data) {
	            a = data[d].iso3;					// Paese
	            b = parseFloat(data[d].HLT2013);	// valore health 2013
	            if (b == -1.0)
            		d1[a] = "#A1A1A1"
	            else
	            	d1[a] = colormap(Math.round(1000*b));
			}
			map.updateChoropleth(d1);
		})
    });

	$("input:radio[value='empowerment']").change(function(){
		// implementare enter() dataset con dati empowerment
		factor = "empowerment";
	});
	$("input:radio[value='labourforce']").change(function(){
		// implementare enter() dataset con dati labour force participation rate
		factor = "labourforce";
	});
});