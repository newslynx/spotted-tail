(function(){

	d3.csv('data/sp500.csv', drawChart)

	function drawChart(sp500){
		var formatDate = d3.time.format("%b %Y");

		d3.select('#st-chart')
			.datum(sp500)
	  .call(spottedTail()
	    .x(function(d) { return formatDate.parse(d.date); })
	    .y(function(d) { return +d.count; }))
	  	// .on('mouseover', function(d){console.log(d)});
		
	}

}).call(this);