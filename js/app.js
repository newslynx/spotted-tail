(function(){

	d3.csv('data/sp500.csv', drawChart)

	function drawChart(sp500){
		var formatDate = d3.time.format("%b %Y");

		var legend =  {
						facebook: {metric: 'likes', color: "#3B5998"},
						twitter: {metric: 'mentions', color: "#55ACEE"}
					};

		d3.select('#st-chart')
			.datum(sp500)
	  .call(spottedTail()
	    .x(function(d) { return formatDate.parse(d.date); })
	    .y(function(d) { return +d.count; })
	  	.legend(legend))
		
	}

}).call(this);