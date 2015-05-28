
$("document").ready(function(){
	// CREAZIONE AMBIENTE SVG
	var svg = d3.select("body").append("svg")
		.attr("width", 800)
		.attr("height", 600)
		.attr("viewBox", "0 0 800 600");

	var mainRect = svg.append("rect")
	   .attr("x",0)
	   .attr("y",0)
	   .attr("width",800)
	   .attr("height",600)
	   .attr("fill", "none")
	   .attr("stroke", "black")
	   .attr("stroke-width", 1);

	// AGGIUNGO ROBA A CASO
	var cerchiotto = svg.append("circle")
		.attr("cx", 100)
		.attr("cy", 100)
		.attr("r", 100)
		.style("fill","purple");

	// bottone
	$("#b1").click(function(){
		cerchiotto.transition()
			.attr("cx", 450)
			.attr("cy", 450)
			.style("opacity", 50)
			.duration(1500);
	})
});