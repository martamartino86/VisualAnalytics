var map = null;
var colormap;
var factor = "gii"; // default factor
var gii_palette = ["#FFE8F6", "#AD3D7E"]; // (rosa scuro -> chiaro)
var health_palette = ["#f7fbff", "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#08519c", "#08306b"] // (azzurro chiaro -> scuro)
var empow_palette = ["#fdae6b", "#fd8d3c", "#f16913", "#d94801", "#a63603", "#7f2704"]; // (arancio -> marrone)
var labourf_palette = ["#f7fcf5", "#e5f5e0", "#c7e9c0", "#a1d99b", "#74c476", "#41ab5d", "#41ab5d", "#005a32"]; // (verde chiaro -> scuro)
var dsv = d3.dsv(";", "text/plain");
var d1 = {}, d2 = {};

// var miageografia;	// TEST
// var miadata;		// TEST


// crea e restituisce la funzione per colorare i dati del "factor" da visualizzare
function color_factor(data) {
	switch (factor) {
		case "gii":
			max_dataset = d3.max(data, function(d){return parseFloat(d.GII2013.replace(',','.'));});
			min_dataset = d3.min(data, function(d) {
				q = parseFloat(d.GII2013.replace(',','.'));
				if (q == -1) return max_dataset+1;
				else return q;
			})
			colormap = d3.scale.linear()
				.domain([min_dataset*1000, max_dataset*1000])
				.range(gii_palette);
			break;
		case "health":
			max_dataset = d3.max(data, function(d){return parseFloat(d.HLT2013.replace(',','.'));});
			min_dataset = d3.min(data, function(d) {
				q = parseFloat(d.HLT2013.replace(',','.'));
				if (q == -1) return max_dataset+1;
				else return q;
			})
			colormap = d3.scale.linear()
				.domain([min_dataset*1000, 520, 530, 540, 550, 560, 570, 580, max_dataset*1000])
				.range(health_palette);
			break;
		case "empowerment":
			max_dataset = d3.max(data, function(d) {return parseFloat(d.EMP2013.replace(',','.'));});
			min_dataset = d3.min(data, function(d) {
				q = parseFloat(d.EMP2013.replace(',','.'));
				if (q == -1) return max_dataset+1;
				else return q;
			})
			colormap = d3.scale.linear()
				.domain([min_dataset*1000, 200, 300, 400, 500, 600, max_dataset*1000])
				.range(empow_palette);
			break;
		case "labourforce":
			max_dataset = d3.max(data, function(d) {return parseFloat(d.LFRP2013.replace(',','.'));});
			min_dataset = d3.min(data, function(d) {
				q = parseFloat(d.LFRP2013.replace(',','.'));
				if (q == -1) return max_dataset+1;
				else return q;
			})
			colormap = d3.scale.linear()
				.domain([min_dataset*1000, 300, 400, 500, 600, 700, 800, max_dataset*1000])
				.range(labourf_palette);
			break;
	}
	$(".colorBarMinText").text(min_dataset);
	$(".colorBarMaxText").text(max_dataset);
	return colormap;
}

// costruisce i dizionari da assegnare a "fills" e "data" nel costruttore della mappa.
function get_data(data) {
	// creo la funzione per colorare i dati
	colormap = color_factor(data);
	// creo i due dizionari (NB: d2 deve essere ricreato ogni volta, ma d1 no)
	if ($.isEmptyObject(d2)) {
		for (d in data) {
	        country = data[d].iso3;
	        v1 = parseFloat(data[d].GII2013.replace(',','.'));
	        v2 = parseFloat(data[d].HLT2013.replace(',','.'));
	        v3 = parseFloat(data[d].EMP2013.replace(',','.'));
	        v4 = parseFloat(data[d].LFRP2013.replace(',','.'));
	        // dopo aver parsato tutti gli indici, li inserisco nel dizionario
	    	d2[country] = {fillkey:country, GII2013: v1, HLT2013: v2, EMP2013: v3, LFRP2013: v4}
	        switch (factor) {
	        	case "gii":
	        		v = v1;
	        		break;
	        	case "health":
	        		v = v2;
	        		break;
	        	case "empowerment":
	        		v = v3;
	        		break;
	        	case "labourforce":
	        		v = v4;
	        		break;
	        }
	        // dizionario 1: ISO3 -> colore
			if (v == -1.0)
	        	d1[country] = "#A1A1A1"
	        else
	        	d1[country] = colormap(Math.round(1000*v));
		}
	}
	else {
		for (d in data) {
	        country = data[d].iso3;
	        v1 = parseFloat(data[d].GII2013.replace(',','.'));
	        v2 = parseFloat(data[d].HLT2013.replace(',','.'));
	        v3 = parseFloat(data[d].EMP2013.replace(',','.'));
	        v4 = parseFloat(data[d].LFRP2013.replace(',','.'));
	        switch (factor) {
	        	case "gii":
	        		v = v1;
	        		break;
	        	case "health":
	        		v = v2;
	        		break;
	        	case "empowerment":
	        		v = v3;
	        		break;
	        	case "labourforce":
	        		v = v4;
	        		break;
	        }
			if (v == -1.0)
	        	d1[country] = "#A1A1A1"
	        else
	        	d1[country] = colormap(Math.round(1000*v)); // dizionario 1: ISO3 -> colore
		}
	}
	d1.defaultFill = '#A1A1A1';
	return [d1, d2];
}

function initiate_map() {
	// get GII data and build map object
	dsv("starting_dataset.csv", function(data){
		var dict = get_data(data); // mi costruisco i dizionari (con tanto di colorazione già pronta)
		miadata = data;
		// se la mappa non l'ho ancora costruita, gli assegno i dati ecc.
		if (map == null) {
			map = new Datamap({
				element: document.getElementById('mapcontainer'),
				geographyConfig: {
					highlightBorderColor: '#bada55',
					popupTemplate: function(geography, data) {
						// data rappresenta una riga di d2: {fillKey: <>, GII2013: <>, HLT2013: <>, ...}
						// relativa al Paese su cui sto facendo mouseover.
						// data (che dovrebbe dirmi dove sono col mouse) non ha alcun valore se non gli ho assegnato precedentemente un valore io.
						// Quindi devo prima controllare che coincida con geography.id (altrimenti non accedo!)
						if (data === null)
							return '<div class="hoverinfo_no">' + geography.properties.name + '\'s data not available'
						else {
							switch (factor) {
								case "gii":
									index = "GII2013"
									value_print = data.GII2013;
									break;
								case "health":
									index = "HLT2013"
									value_print = data.HLT2013;
									break;
								case "empowerment":
									index = "EMP2013"
									value_print = data.EMP2013;
									break;
								case "labourforce":
									index = "LFRP2013"
									value_print = data.LFRP2013;
									break;
							}
							return '<div class="hoverinfo">' + geography.properties.name + ' <br> ' + index + ': ' + value_print + ' '
						}
						
					},
					highlightBorderWidth: 1,
					highlightFillColor: '#FFF700',
					borderColor: '#CCCCCC'
				},
				dataType: 'csv',
				fills: dict[0], //d1,
				data: dict[1],  //d2,
				projection: "mercator",
				done: function (datamap){
					datamap.svg.selectAll('.datamaps-subunit')
						// evento CLICK MAPPA: nuova finestra con dati temporali del factor
						.on('click',function(geography){
							// se i dati non sono disponibili, non visualizzo neanche il div.
		    				pos = searchCountryAndValue(geography,data);
							if (pos == -1)  {
								$("#dialog").append(geography.properties.name+"\'s data are not available.")
								return;
							}
							// rendo visibile il divchart
							d3.select("#divchart")
								.style("visibility", "visible");
							d3.select("#containerchart")
								.style("visibility", "visible");
							// chiamo la funzione di graphscript.js
							linechart(geography.id);
						});
					// ZOOM rotella || double click
					datamap.svg.call(d3.behavior.zoom().on("zoom", redraw));
		            function redraw() {
		            	datamap.svg.selectAll("g").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
		            }
				}
			});
		}
		// per colorare la mappa
		map.updateChoropleth(dict[0]);
	});
}

// CORPO DEL TUTTO
$("document").ready(function(){
	var width = document.getElementById('mapcontainer').offsetWidth;
	var height = document.getElementById('mapcontainer').offsetHeight;
	// MAPPA INIZIALE
	initiate_map();
	set_legend(gii_palette);
	// RADIO BUTTON
	$("input:radio[value='gii']").change(function() {
		factor = "gii";
		$("#indici").text("The index (related to 2013 data) shows the loss\
				in potential human development due to inequality between\
				female and male achievements in these dimensions. It varies\
				between 0, where women and men fare equally, and 1, where\
				either gender fares as poorly as possible in all measured\
				dimensions.");
		initiate_map();
		set_legend(gii_palette);
	});
	$("input:radio[value='health']").change(function(){
		factor = "health";
		$("#indici").text("Reproductive health is measured by maternal mortality ratio and adolescent birth rates.\
			A higher value is sign of a better female reproductive health.");
		initiate_map();
		set_legend(health_palette);
    });

	$("input:radio[value='empowerment']").change(function(){
		factor = "empowerment";
		$("#indici").text("Empowerment is measured by proportion of parliamentary\
			seats occupied by females, and proportion of adult females and males\
			aged 25 years and older with at least some secondary education.\
			A higher value indicates a situation with men and women equally educated and politically active.");
		initiate_map();
		set_legend(empow_palette);
	});
	$("input:radio[value='labourforce']").change(function(){
		factor = "labourforce";
		$("#indici").text("Economic status is expressed as labour market participation\
		 and measured by labour force participation rate of female and male\
		 populations aged 15 years and older. A higher value means that women and men are\
		 equally present into labour market.");
		initiate_map();
		set_legend(labourf_palette);
	});
});

function set_legend(p) {
	var c = document.getElementById("myCanvas");
	var ctx = c.getContext("2d");
	var grd = ctx.createLinearGradient(0, 0, 170, 0);
	grd.addColorStop(0, p[0]);
	grd.addColorStop(1, p[p.length-1]);
	ctx.fillStyle = grd;
	ctx.fillRect(0, 0, 220, 220);
}
// controlla se il Country selezionato nella geomappa è presente nei miei dati, e se è presente controlla che non abbia valore -1
function searchCountryAndValue(geomappa, data) {
	for (d in data) {
		if (geomappa.id == data[d].iso3)
			return d;
	}
	return -1;
}