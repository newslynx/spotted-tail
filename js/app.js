(function(){

	var formatDate = d3.time.format("%b %Y");
	var legend =	{
		facebook: {metric: 'likes', color: "#3B5998"},
		twitter: {metric: 'mentions', color: "#55ACEE"}
	}
	var notes = [
		{
			date: 'Sep 2007',
			text: 'A sample note',
			type: 'impact-event'
		},
		{
			date: 'Jul 2005',
			text: 'Another note',
			type: 'social-media-event'
		}
	]
				
	var stChart = spottedTail()
			.x(function(d) { return formatDate.parse(d.date); })
			.y(function(d) { return +d.count; })
			.margin({right: 20})
			.legend(legend)
			.notes(notes);

	d3.csv('data/dummy-data.csv', drawChart);

	function drawChart(data_){
		d3.select('#ST-chart')
			.datum(data_)
		.call(stChart)
	}

}).call(this);