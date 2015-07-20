(function(){

	var timezone = 'US/Eastern';
	var legend =	{
		facebook: {service: 'Facebook', metric: 'likes', color: '#3B5998', group: 'a'},
		twitter: {service: 'Twitter', metric: 'mentions', color: '#55ACEE', group: 'a'},
		pageviews: {service: '', metric: 'pageviews', color: '#fc0', group: 'b'}
	}

	var promotions = [
		// {
		// 	created: ['2015-07-11T04:36:52.356128+00:00','2015-07-12T12:36:52.392158+00:00'],
		// 	category: 'promotion',
		// 	level: 'homepage',
		// 	link: 'http://mhkeller.com',
		// 	text: 'mhk',
		// 	color: '#fc0'
		// },
	]

	var events = [
		{
			created: '2015-07-11T14:36:52.392158+00:00',
			name: 'FB post',
			impact_tag_categories: ['promotion'],
			impact_tag_levels: ['internal'],
			impact_tags_full: [
				{
					category: 'promotion',
					level: 'media',
					name: 'internal promotion',
					color: '#fc0'
				}
			],
			related_links: []
		},{
			created: '2015-07-11T12:36:52.392158+00:00',
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
			created: '2015-07-12T04:36:52.356128+00:00',
			name: 'Ralph Lauren talked about us',
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
			created: '2015-07-11T20:36:58.058445+00:00',
			name: 'A dog talked about us',
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
			// .promotions(promotions)
			.timezone(timezone)
			.interpolate('step-after')
			.onBrush(function(dateRange, empty){
				console.log(dateRange, empty)
			});

	d3.csv('data/dummy-data.csv', drawChart);

	function drawChart(data_){
		// Convert our timestamps to numbers
		d3.select('#ST-chart')
			.datum(data_)
		.call(stChart)
	}

}).call(this);