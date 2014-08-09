(function(){

	var formatDate = d3.time.format('%Y-%m-%d');
	var legend =	{
		facebook: {metric: 'likes', color: '#3B5998', group: 'a'},
		twitter: {metric: 'mentions', color: '#55ACEE', group: 'a'},
		pageviews: {metric: 'pageviews', color: '#fc0', group: 'b'}
	}
	var notes = [
		{
			date: '2001-09-01',
			text: 'A sample note',
			type: ['note']
		}
	]

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
			date: '2001-05-02',
			name: 'Jon Stewart talked about us',
			tags: [
				{
					categories: ['citation'],
					attributes: ['media']
				}
			],
			related_links: []
		}
	]
				
	var stChart = spottedTail()
			.x(function(d) { return formatDate.parse(d.date); })
			.y(function(d) { return +d.count; })
			.legend(legend)
			.eventSchema(eventSchema)
			.events(events);
			// .notes(notes);

	d3.csv('data/dummy-data.csv', drawChart);

	function drawChart(data_){
		d3.select('#ST-chart')
			.datum(data_)
		.call(stChart)
	}

}).call(this);