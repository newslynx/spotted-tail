(function(){

	var formatDate = d3.time.format('%b %Y');
	var legend =	{
		facebook: {metric: 'likes', color: '#3B5998', group: 'a'},
		twitter: {metric: 'mentions', color: '#55ACEE', group: 'a'},
		pageviews: {metric: 'pageviews', color: '#fc0', group: 'b'}
	}
	var notes = [
		{
			date: 'Sep 2001',
			text: 'A sample note',
			type: ['note']
		},
		{
			date: 'Jul 2002',
			text: 'Social media event, impact event',
			type: ['impact-event', 'social-media-event']
		},
		{
			date: 'Aug 2001',
			text: 'Impact event',
			type: ['impact-event']
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