(function(){

	var timezone = 'US/Eastern';
	var legend =	{
		facebook: {service: 'Facebook', metric: 'likes', color: '#3B5998', group: 'a'},
		twitter: {service: 'Twitter', metric: 'mentions', color: '#55ACEE', group: 'a'},
		pageviews: {service: '', metric: 'pageviews', color: '#fc0', group: 'b'}
	}

	var promotions = [
		{
			timestamp: [962409600,976739900],
			category: 'promotion',
			level: 'homepage',
			link: 'http://mhkeller.com',
			text: 'mhk',
			color: '#fc0'
		},
		{
			timestamp: 976739900,
			category: 'promotion',
			level: 'tweet',
			link: 'http://twitter.com/mhkeller',
			text: 'mhk',
			color: '#0cf'
		}
	]

	var events = [
		{
			timestamp: 962409600,
			name: 'Jon Stewart talked about us',
			impact_tag_categories: ['citation'],
			impact_tag_levels: ['media'],
			impact_tags_full: [
				{
					category: 'citation',
					level: 'media',
					name: 'media citation',
					color: '#c0f'
				}
			],
			related_links: []
		},{
			timestamp: 976739900,
			name: 'Jon Stewart talked about us',
			impact_tag_categories: ['change'],
			impact_tag_levels: ['media'],
			impact_tags_full: [
				{
					category: 'change',
					level: 'media',
					name: 'media change',
					color: '#0cf'
				}
			],
			related_links: []
		},{
			timestamp: 972628700,
			name: 'Jon Stewart talked about us',
			impact_tag_categories: ['citation'],
			impact_tag_levels: ['media'],
			impact_tags_full: [
				{
					category: 'citation',
					level: 'media',
					name: 'media citation',
					color: '#f0c'
				}
			],
			related_links: []
		}
	]
				
	var stChart = spottedTail()
			.y(function(d) { return +d.count; })
			.legend(legend)
			.events(events)
			.promotions(promotions)
			.timezone(timezone)
			.interpolate('step-after')
			.onBrush(function(dateRange, empty){
				console.log(dateRange, empty)
			});

	d3.csv('data/dummy-data.csv', drawChart);

	function drawChart(data_){
		// Convert our timestamps to numbers
		data_.forEach(function(row){
			row.timestamp = +row.timestamp
		})
		d3.select('#ST-chart')
			.datum(data_)
		.call(stChart)
	}

}).call(this);