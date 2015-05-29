var map = null;
var colormap;
var d1 = {}, d2 = {};
var dsv = d3.dsv(";", "text/plain");

function show_gii() {
	console.log("show gii");
	dsv("gii_index.csv", function(data){
		colormap = d3.scale.linear()
						.domain([0, 1000])
						.range(["#FFE8F6", "#AD3D7E"]);
		for (d in data) {
            a = data[d].iso3;									// ISO3
            b = parseFloat(data[d].GII2013.replace(',','.'));
            //console.log(colormap(Math.round(1000*b)));
            if (b == -1.0)
            	d1[a] = "#A1A1A1"
            else
            	d1[a] = colormap(Math.round(1000*b));				// dizionario 1: ISO3 -> colore
            d2[a] = {fillKey: a}									// dizionario 2: ISO3 -> fillkey: ISO3
		}
		d1.defaultFill = '#A1A1A1';
		console.log(d1)
		console.log(d2)
		if (map == null) {
			console.log("mumble");
			map = new Datamap({
			element: document.getElementById('container'),
			dataType: 'csv',
			fills: d1,
			data: d2,
			projection: "mercator",
			geographyConfig: {
				borderColor: '#CCCCCC'
			}
			});
			// SETTA EVENTI MAPPA
			map.svg.selectAll('.datamaps-subunit').on('click',function(geography){
				console.log(geography);
				// map.options.setProjection(function(element){
				// 	var projection = d3.geo.equirectangular()
				//     	.center([23, -3])
				//         .rotate([4.4, 0])
				//         .scale(400)
				//         .translate([element.offsetWidth / 2, element.offsetHeight / 2]);
				//     var path = d3.geo.path()
				//         .projection(projection);
				// });
			});

		}
		else
		{
			map.updateChoropleth(d1);
			console.log("modificato");
		}
	});
}
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
	// MAPPA INIZIALE: GII
	show_gii();
	$("input:radio[value='gii']").change(show_gii);
	$("input:radio[value='health']").change(function(){
		// implementare enter() dataset con dati health
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
		// zoom and pan
		var zoom = d3.behavior.zoom()
   			.on("zoom",function() {
		        g.attr("transform","translate("+ 
		        	d3.event.translate.join(",")+")scale("+d3.event.scale+")");
		        g.selectAll("path")  
		            .attr("d", path.projection(projection)); 
		svg.call(zoom);
  });

svg.call(zoom)
	});
	$("input:radio[value='empowerment']").change(function(){
		// implementare enter() dataset con dati empowerment
	});
	$("input:radio[value='labourforce']").change(function(){
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
        if(gii_index[pro-p] === "iso3") {
        	alert (gii_index[prop]);
        }
    }
    */
});