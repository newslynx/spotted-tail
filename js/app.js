(function(){

	var timezone_offset = -4;
	var legend =	{
		facebook: {service: 'Facebook', metric: 'likes', color: '#3B5998', group: 'a'},
		twitter: {service: 'Twitter', metric: 'mentions', color: '#55ACEE', group: 'a'},
		pageviews: {service: '', metric: 'pageviews', color: '#fc0', group: 'b'}
	}

	var eventSchema = [
		{
			name: 'Citation',
			properties: {
				color: '#fc0',
				subTypes: [
					{name: 'City council', color: '#fc1'}
				]
			}
		},		{
			name: 'Change',
			properties: {
				color: '#f0c',
				subTypes: [
					{name: 'Legislative action', color: '#f1c'}
				]
			}
		},		{
			name: 'Achievement',
			properties: {
				color: '#0cf',
				subTypes: [
					{name: 'Best monthly traffic', color: '#1cf'}
				]
			}
		},		{
			name: 'Other',
			properties: {
				color: '#cc',
				subTypes: []
			}
		}
	]

	var events = [
		{
			timestamp: 962409600,
			name: 'Jon Stewart talked about us',
			impact_tags_full: [
				{
					category: 'citation',
					attribute: 'media'
				}
			],
			related_links: []
		},
		{
			timestamp: 975628800,
			name: 'Jon Stewart talked about us',
			impact_tags_full: [
				{
					category: 'change',
					attribute: 'media'
				}
			],
			related_links: []
		}
	]
				
	var stChart = spottedTail()
			.x(function(d) {
				var utc_date = new Date(d.timestamp*1000),
						user_timezone_date = new Date(new Date(utc_date).setHours(utc_date.getHours() + timezone_offset ));
				return user_timezone_date;
			})
			.y(function(d) { return +d.count; })
			.legend(legend)
			.eventSchema(eventSchema)
			.events(events)
			.timezoneOffset(timezone_offset)
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