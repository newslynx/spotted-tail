(function(){

	d3.csv('data/dummy-data.csv', drawChart)

	function drawChart(data){
		var formatDate = d3.time.format("%b %Y");

		var legend =	{
						facebook: {metric: 'likes', color: "#3B5998"},
						twitter: {metric: 'mentions', color: "#55ACEE"}
					};

		d3.select('#ST-chart')
			.datum(data)
		.call(spottedTail()
			.x(function(d) { return formatDate.parse(d.date); })
			.y(function(d) { return +d.count; })
			.legend(legend))
		
	}

}).call(this);