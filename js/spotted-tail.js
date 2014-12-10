function spottedTail() {

	'use strict'

	var selection;

	var customTimeFormat = d3.time.format.multi([
		['.%L', function(d) { return d.getMilliseconds(); }],
		// [':%S', function(d) { return d.getSeconds(); }],
		['%I:%M', function(d) { return d.getMinutes(); }],
		['%I %p', function(d) { return d.getHours(); }],
		['%a %d', function(d) { return d.getDay() && d.getDate() != 1; }],
		['%b %e', function(d) { return d.getDate() != 1; }],
		['%b', function(d) { return d.getMonth(); }],
		['%Y', function() { return true; }]
	]);

	var first_run = true,
			selection_canvas,
			dimensions = {},
			margin = {},
			marginBrush = {},
			marginEvents = {},
			events_width,
			chart_width,
			chart_width_brush,
			chart_height,
			chart_height_full,
			chart_height_brush,
			chart_height_brush_full,
			events_row_height,
			event_circle_radius,
			xValue,
			yValue,
			legend,
			spots,
			promotions,
			interpolate,
			timezone,
			events,
			onBrush,
			eventsMinDate,
			promosMinDate,
			eventsMaxDate,
			promosMaxDate,
			hover_window_container,
			follow_line_g,
			follow_line,
			number_of_legend_ticks = 3,
			color = d3.scale.category10(),
			xScale = d3.time.scale(),
			xScaleBrush = d3.time.scale(),
			yScales = {},
			yScalesBrush = {},
			xAxis = d3.svg.axis().scale(xScale).orient('bottom').tickSize(6, 0).tickFormat(customTimeFormat).ticks(6),
			yAxes = {},
			y_domains = {},
			xAxisBrush = d3.svg.axis().scale(xScaleBrush).orient('bottom'),
			lines = {},
			linesBrush = {},
			brush = d3.svg.brush().x(xScaleBrush),
			bisectDate = d3.bisector(function(d) { return d.timestamp; }).left,
			ppNumber = function(str) { 
				if (typeof str != 'string') str = str.toString();
				return str.replace(/\B(?=(\d{3})+(?!\d))/g, ","); 
			},
			// ppNumber = function(str) { return str.replace(/\B(?=(\d{3})+(?!\d))/g, ","); },
			ppDate = function(dObj) { return dObj.toDateString() },
			addCommas = d3.format(',');

			yScales['a'] = d3.scale.linear();
			yScalesBrush['a'] = d3.scale.linear();
			yScales['b'] = d3.scale.linear();
			yScalesBrush['b'] = d3.scale.linear();

			yAxes['a'] = d3.svg.axis().scale(yScales['a']).orient('left').ticks(number_of_legend_ticks).tickFormat(d3.format('s'));
			yAxes['b'] = d3.svg.axis().scale(yScales['b']).orient('right').ticks(number_of_legend_ticks).tickFormat(function(d, i){
				var suffix = (i == number_of_legend_ticks - 1) ? ' Pv' : '',
						val = d3.format('s')(d);
				return val + suffix;
			});




	function chart(selection_) {
		selection = selection_;
		selection.each(function(data, idx) {
			d3.select(this).html('');

			lines['a'] = d3.svg.line().interpolate(interpolate).x(X).y(Ya);
			lines['b'] = d3.svg.line().interpolate(interpolate).x(X).y(Yb);

			linesBrush['a'] = d3.svg.line().interpolate(interpolate).x(XBrush).y(YBrushA);
			linesBrush['b'] = d3.svg.line().interpolate(interpolate).x(XBrush).y(YBrushB);

			if (first_run){
				data = parseDates(data);

				events = transformEventsIntoSpots(events);
				promotions = transformPromotionsIntoSpots(promotions);
				spots = promotions.concat(events);
				// spot_values = spots.map(function(sp){
				// 	return sp.values.discrete;
				// });
			}
			var number_of_event_rows = spots.length;

			// Define the width based on the dimensions of the input container
			var ctnr = document.getElementById(selection[idx][0].id);

			dimensions = {width: ctnr.offsetWidth, height: ctnr.offsetHeight};

			margin = extend({top: 10, right: 40, bottom: 0, left: 75}, margin);
			marginEvents = extend({top: margin.top, top_buffer: 35, right: margin.right, bottom: 20, left: margin.left}, marginEvents); // topBuffer is for the bottom axis
			marginBrush = extend({top: 0, right: margin.right, bottom: 0, left: margin.left}, marginBrush);
			chart_width = dimensions.width - margin.left - margin.right;
			chart_width_brush = dimensions.width - marginBrush.left - marginBrush.right;
			chart_height_full = 200;
			chart_height = chart_height_full - margin.top - margin.bottom;
			chart_height_brush_full = 75;
			chart_height_brush = chart_height_brush_full - marginBrush.top - marginBrush.bottom;
			events_row_height = 30;
			event_circle_radius = 5;

			// Set the height back to the container
			var st_height = (chart_height_full + chart_height_brush_full + events_row_height*number_of_event_rows + marginEvents.top + marginEvents.top_buffer) + 'px';

			var metric_names = Object.keys(legend);

			// Set our value categories to everything except for things called date
			color.domain(metric_names);

			var metrics = metric_names.map(function(name) {
				function reformatDatum(datum){
					return {
									timestamp: datum.timestamp, 
									count: +datum[name]
								};
				}

				var values = [];
				data.forEach(function(d, index){
					var fill_in = true,
							prev_value,
							prev_index = index - 1,
							formatted_data;
					// Don't let previous index go below zero
					if (prev_index < 0) { prev_index = 0; }
					// Return this object if it's a timeseries_stat that has the key that is for this loop
					// Only comes into play when dealing with sparse data
					var metrics_captured_at_this_timestamp_stat = Object.keys(d),
							timestamp_stat_includes_metric = metrics_captured_at_this_timestamp_stat.indexOf(name) != -1;

					if (fill_in) {
						// If we're filling in, then add the previous value to this stat
						// Or zero if the previous one doesn't exist.
						if (!timestamp_stat_includes_metric) {
							prev_value = data[prev_index][name] || 0;
							d[name] = prev_value;
							// Set this to true since we're always including it
							timestamp_stat_includes_metric = fill_in;
						}
					}
					// This will be false if the key wasn't included and we're not filling in
					if (timestamp_stat_includes_metric){
						// Map this object
						formatted_data = reformatDatum(d);
						values.push(formatted_data);
					}

				});

				return { 
					name: name,
					group: legend[name].group,
					display_name: legend[name].service,
					values: values
				}
			});

			// Nest by group
			metrics = d3.nest()
				.key(function(d){ return d.group })
				.map(metrics);


			// Get the initial mins and maxes based on the timestamp
			var x_domain = d3.extent(data, function(d) { return d.timestamp; });
			// And then throw some more candidates into the mix with promos and eventsMaxDates
			x_domain[1] = d3.max([x_domain[1], promosMaxDate, eventsMaxDate]);
			// Do the same for minimums in case events or promos happen before
			x_domain[0] = d3.min([x_domain[0], promosMinDate, eventsMinDate]);

			var y_max = {};
			y_max['a'] = d3.max(metrics['a'], function(c) { return d3.max(c.values, function(v) { return v.count; }); })
			y_max['b'] = d3.max(metrics['b'], function(c) { return d3.max(c.values, function(v) { return v.count; }); })
			y_domains['a'] = [0, (y_max['a'] + y_max['a']*.5)];
			y_domains['b'] = [0, (y_max['b'] + y_max['b']*.1)];

			// If the maxes are one, limit the number of y axis ticks to one
			// Not sure why this isn't two since we have the 0 and then the 1
			['a','b'].forEach(function(ax, i){
				if (!y_max[ax] || y_max[ax] <= 1) {
					yAxes[ax] = d3.svg.axis().scale(yScales[ax]).orient('left').ticks(1).tickFormat(d3.format('f'));
				}
			})


			// Update the x-scale.
			xScale
					.domain(x_domain)
					.range([0, chart_width]);

			// Update the y-scale.
			yScales['a']
					.domain(y_domains['a'])
					.range([chart_height, 0]);

			yScales['b']
					.domain(y_domains['b'])
					.range([chart_height, 0]);

			// Update the y-scale.
			yScalesBrush['a']
					.domain(y_domains['a'])
					.range([chart_height_brush, 0]);

			yScalesBrush['b']
					.domain(y_domains['b'])
					.range([chart_height_brush, 0]);

			// Update the x-scale.
			xScaleBrush
					.domain(x_domain)
					.range([0, chart_width_brush]);

			// Append the svg element
			selection_canvas = d3.select(this);
			var svg = selection_canvas.append('svg').attr('class', 'ST-canvas');

			// Clipping path for chart
			svg.append('defs').append('clipPath')
					.attr('id', 'ST-clip-lines')
				.append('rect')
					.attr('width', chart_width + 1) // Add one so the lines dont' appear clipped
					.attr('height', chart_height);

			// Clipping path for event circles
			svg.append('defs').append('clipPath')
					.attr('id', 'ST-clip-circles')
				.append('rect')
					.attr('width', chart_width + 1 + event_circle_radius*2) // Add one so the lines dont' appear clipped
					.attr('height', chart_height)
					.attr('transform', 'translate('+(-1*event_circle_radius + margin.left)+',0)')

			// Add the follow line below everything
			follow_line_g = svg.append('g')
					.attr('id', 'ST-follow-line-container')
					.style('display', 'none')
					.attr('transform', 'translate('+margin.left+',0)');

			follow_line = follow_line_g.append('line')
						.classed('ST-follow-line', true)
						.attr("y1", 0);

			// Lines
			var lineChartCtnr = svg.append('g')
														.classed('ST-line-g', true)
														.classed('ST-container', true)
														.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
			// For mouseevents										 
			// // lineChartCtnr.append('rect')
			// // 		.attr('width', chart_width)
			// // 		.attr('height', chart_height)
			// // 		.attr('fill', 'none')
			// 		.attr('pointer-events', 'all')
			svg.on('mouseenter', activateHover)
					.on('mouseleave', deactivateHover)
					.on('mousemove', mousemove);

			// line with clipping path, axes
			lineChartCtnr.append('g').attr('class', 'ST-y ST-axis').attr('data-group','a');
			lineChartCtnr.append('g').attr('class', 'ST-y ST-axis').attr('data-group','b');
			lineChartCtnr.append('g').attr('class', 'ST-x ST-axis');

			// Brush container
			var brushCtnr		 = svg.append('g')
														.classed('ST-brush', true)
														.classed('ST-container', true)
														.attr('transform', 'translate(' + marginBrush.left + ',' + (chart_height_full +marginEvents.top + marginEvents.top_buffer+ events_row_height*number_of_event_rows ) + ')')

			// line, brusher, axes
			// brushCtnr.append('path').attr('class','metric-line');
			brushCtnr.append('g').attr('class', 'ST-x ST-brusher').call(brush.on('brush', brushed)).selectAll('rect').attr('y', -6).attr('height', chart_height_brush + 7);
			brushCtnr.append('g').attr('class', 'ST-x ST-axis');

			// Events container
			var eventsCntnr  = svg.append('g')
														.classed('ST-categories', true)
														.classed('ST-container', true)
														.attr('transform', 'translate(0,' + (chart_height + marginEvents.top + marginEvents.top_buffer) + ')')

			// Update the outer dimensions to the full dimensions including the margins.
			svg .attr('width', dimensions.width)
					.attr('height', st_height)
			ctnr.style.height = st_height;

			follow_line.attr('y2', (parseInt(st_height) - chart_height_brush - 10) )

			// Update the line path.
			lineChartCtnr.selectAll('.ST-metric-line[data-group="a"]')
					.data(metrics['a'])
				.enter().append('g')
					.attr('class', 'ST-metric-line')
					.attr('data-group', 'a')

			lineChartCtnr.selectAll('.ST-metric-line[data-group="a"]')
				.append('path')
					.attr('class', 'ST-line')
					.style('clip-path', 'url(#ST-clip-lines)')
					.attr('d', function(d) { return lines['a'](d.values); })
					.style('stroke', function(d) { return legend[d.name].color || color(d.name); });

			// And its xAxis
			lineChartCtnr.select('.ST-x.ST-axis')
					.attr('transform', 'translate(0,' + yScales['a'].range()[0] + ')') // This can be either yScale because they have the same range
					.call(xAxis);

			// Do it for b
			lineChartCtnr.selectAll('.ST-metric-line[data-group="b"]')
					.data(metrics['b'])
				.enter().append('g')
					.attr('class', 'ST-metric-line')
					.attr('data-group', 'b')

			lineChartCtnr.selectAll('.ST-metric-line[data-group="b"]')
				.append('path')
					.attr('class', 'ST-line')
					.style('clip-path', 'url(#ST-clip-lines)')
					.attr('d', function(d) { return lines['b'](d.values); })
					.style('stroke', function(d) { return legend[d.name].color || color(d.name); });

			// // Dynamic interval calculation
			// calcTimeInts();

			// And its xAxis
			lineChartCtnr.select('.ST-x.ST-axis')
					.attr('transform', 'translate(0,' + yScales['b'].range()[0] + ')') // This can be either yScale because they have the same range
					.call(xAxis);

			// Tuck the first one in by half its width
			// You could also set `text-anchor` to `start` but that wasn't working
			// lineChartCtnr.select('.ST-x.ST-axis')
			// 		.selectAll('.tick text')
			// 			.each(function(d,i){ 
			// 				var offset;
			// 				if (i == 0) {
			// 					if (this.getBBox() && this.getBBox().width) {
			// 						offset = this.getBBox().width;
			// 						d3.select(this).attr('x', offset);
			// 					}
			// 				}
			// 			});
						// .attr('x', function(d,i){ return (i == 0) ? this.getBBox().width/2 : 0 });
						// .attr('text-anchor', function(d,i){ return (i == 0) ? 'start' : 'middle'})

			// Extend the line all the way to the left and right
			lineChartCtnr.select('.ST-x.ST-axis')
					.append('line')
					.classed('ST-category-timeline-hr', true)
					.attr('x1', 0)
					.attr('x2', chart_width + margin.left + margin.right)
					.attr('transform',' translate('+-1*margin.left+',0)');

			// And the y
			lineChartCtnr.selectAll('.ST-y.ST-axis[data-group="a"]')
					.call(yAxes['a']);

			// And the y
			lineChartCtnr.selectAll('.ST-y.ST-axis[data-group="b"]')
					.attr('transform', 'translate('+(chart_width - 5)+',0)') // Bump it over to the left a little bit
					.call(yAxes['b']);

			// lineChartCtnr.selectAll('.ST-y.ST-axis')
			// 		.call(yAxes['b']);

			// Tuck zero up above the line
			lineChartCtnr.select('.ST-y.ST-axis[data-group="a"]')
					.selectAll('.tick text')
						.attr('y', function(d,i){ return (i == 0) ? -1*8 : 0 });

			lineChartCtnr.select('.ST-y.ST-axis[data-group="b"]')
					.selectAll('.tick text')
						.attr('y', function(d,i){ return (i == 0) ? -1*8 : 0 });

			// And focal points
			// These are drawn last so they always appear on top of everything
			var focus_containers = lineChartCtnr.append('g')
				.attr('class', 'ST-focus-points')
				.selectAll('.ST-focus-point')
				.data( metrics['a'].concat(metrics['b']) )
					.enter();

			var focus_container = focus_containers
					.append('g')
						.attr('class', 'ST-point')
						.style('display', 'none')
						.attr('transform', 'translate(-99,-99)'); // Start them off the screen.


			// Add the circle
			focus_container.append('circle')
						.attr('r', 3);

			// And text components
			focus_container
					.append('text')
						.attr('dy', '.35em');

			// Events container, let's use `_` suffix to mean the enter selection
			var eventTimelineCntnr_ = eventsCntnr.selectAll('.ST-category-timeline')
				.data(spots).enter();

			var eventTimelineCntnr = eventTimelineCntnr_.append('g')
				.classed('ST-category-timeline', true)
				.attr('transform', function(d, i) { return 'translate(0,' + (i*events_row_height) + ')' })
			
			eventTimelineCntnr.append('line')
				.classed('ST-category-timeline-hr', true)
				.attr('x1', 0)
				.attr('x2', chart_width + margin.left + margin.right)
				.attr('y1', events_row_height)
				.attr('y2', events_row_height);

			eventTimelineCntnr.append('text')
				.attr('text-anchor', 'end')
				.classed('ST-category-timeline-name', true)
				.html(function(d) { return d.key; })
				.attr('transform', function(d) { return 'translate('+(margin.left - 10)+','+ ( this.getBBox().height + 5 ) +')' }); // -10 to align with the axis numbers, 5 to give the text some padding

			// Add all the continuous items to this row
			var eventItems_continuous = eventTimelineCntnr.append('g')
				.classed('ST-events-continuous', true)
				.style('clip-path', 'url(#ST-clip-circles)')
				.selectAll('.ST-event-rect-g')
					.data(function(d) { return d.values.continuous; })
					.enter();

			var continuous_g = eventItems_continuous.append('g')
				.classed('ST-event-rect-g', true)
				.classed('ST-tooltipped', true)
				.attr('transform', function(d) { return 'translate('+(margin.left + xScale(d.timestamp[0]))+',0)' }) // Offset this one so the top border can show

			continuous_g.append('rect')
				.classed('ST-event-rect', true)
				.attr('x', '0')
				.attr('width', function(d){ return xScale(d.timestamp[1]) - xScale(d.timestamp[0]) })
				.attr('height', events_row_height - 1) // Make this minus one so it doesn't go below the bottom border
				.style('fill', function(d) { return d.color; }); // Get the color of the first impact tag

			continuous_g.append('text')
				.text(function(d){
					var pretty_date = d.timestamp.map(function(timestamp){ return new Date(timestamp).toLocaleTimeString().replace(/:[0-9][0-9] /, ' ').toLowerCase(); }).join(' to ');
					return pretty_date + ', ' + d.level;
				})
				.attr('text-anchor', 'middle')
				.attr('transform', function(d){
					var width = xScale(d.timestamp[1]) - xScale(d.timestamp[0]) 
					return 'translate('+width/2+','+(events_row_height*1.5)+')';
				});


			// Add all the discrete items to this row
			var eventItems_discrete = eventTimelineCntnr.append('g')
				.classed('ST-events-discrete', true)
				.style('clip-path', 'url(#ST-clip-circles)')
				.selectAll('.ST-event-circle-g')
					.data(function(d) { return d.values.discrete; })
					.enter();

			var discrete_g = eventItems_discrete.append('g')
				.classed('ST-event-circle-g', true)
				.classed('ST-tooltipped', true)
				.attr('transform', function(d,i) { return 'translate('+(margin.left + xScale(d.timestamp) )+',14)' });

			discrete_g.append('circle')
				.classed('ST-event-circle', true)
				.classed('ST-hyperlinked', true)
				.attr('r', event_circle_radius)
				.style('fill', function(d) { return d.color; }) // Get the color of the first impact tag
				.on('click', function(d){
					window.open(d.link);
				})

			discrete_g.append('text')
				.text(function(d){
					var pretty_date = new Date(d.timestamp).toLocaleTimeString().replace(/:[0-9][0-9] /, ' ').toLowerCase();
					var level = d.level.replace(/-/g,' '),
							pretty_level = level.charAt(0).toUpperCase() + level.slice(1);
					return pretty_date + ' - ' + pretty_level;
				})
				.attr('text-anchor', 'middle')
				.attr('transform', function(d,i){ 
					return 'translate(0,'+(events_row_height + 1)+')'; // Plus one because YOLO
				});


			// Add a top rule
			eventsCntnr.append('line')
				.classed('ST-category-timeline-hr', true)
				.attr('x1', 0)
				.attr('x2', chart_width + margin.left + margin.right)
				.attr('transform', 'translate(0,0)')

			// Update the brush path
			brushCtnr.selectAll('.ST-metric-line[data-group="a"]')
					.data(metrics['a'])
				.enter().append('g')
					.attr('class', 'ST-metric-line')
					.attr('data-group', 'a');
			
			// Add the line series
			brushCtnr.selectAll('.ST-metric-line[data-group="a"]')
				.append('path')
					.attr('class', 'ST-line')
					.attr('d', function(d) { return linesBrush['a'](d.values); })
					.style('stroke', function(d) { return legend[d.name].color || color(d.name); })
			

			// Update the brush path with b group
			brushCtnr.selectAll('.ST-metric-line[data-group="b"]')
					.data(metrics['b'])
				.enter().append('g')
					.attr('class', 'ST-metric-line')
					.attr('data-group', 'b');

			// Add the line series
			brushCtnr.selectAll('.ST-metric-line[data-group="b"]')
				.append('path')
					.attr('class', 'ST-line')
					.attr('d', function(d) { return linesBrush['b'](d.values); })
					.style('stroke', function(d) { return legend[d.name].color || color(d.name); })
			
			var brush_categories_container = brushCtnr.selectAll('.ST-categories-brush').data(spots).enter()
				.append('g')
				.classed('ST-categories-brushed', true);
				// .style('clip-path', 'url(#ST-clip-circles)');

			brush_categories_container.selectAll('.ST-events-discrete-brush')
				.data(function(d){ return d.values.discrete; })
				.enter()
					.append('circle')
						.classed('ST-event-circle', true)
						.attr('r', 3)
						.attr('transform', function(d) { return 'translate(0,'+(yScalesBrush['a'].range()[0] - this.getBBox().height) +')' }) // Same as above, this can be either yScalesBrush
						.attr('cx', function(d){ return xScale(d.timestamp) })
						.style('fill', function(d) { return d.color } )
						.style('opacity', .5);


			// // Add all the continuous items to this row
			brush_categories_container.selectAll('.ST-event-continuous-brush')
				.data(function(d) { return d.values.continuous; })
				.enter()
					.append('rect')
						.classed('ST-event-rect', true)
						// .attr('transform', function(d) { return 'translate('+(margin.left)+',0)' })
						.attr('x', function(d){ return xScale(d.timestamp[0]) })
						.attr('y', chart_height_brush - chart_height_brush*.25)
						.attr('width', function(d){ return xScale(d.timestamp[1]) - xScale(d.timestamp[0]) })
						.attr('height', chart_height_brush*.25)
						.style('fill', function(d) { return d.color; }); // Get the color of the first impact tag
						// .on('mouseover', function(d){ console.log(d) });

			hover_window_container = selection_canvas.append('div')
				.attr('id', 'ST-hover-window-container');

			hover_window_container.append('div')
				.classed('ST-hover-timestamp', true);

			// hover_window_container.append('div')
			// 	.classed('ST-hover-facebook', true);
			// 	.append('div')
			// 		.classed('ST-hover-section-title', true)
			// 		.attr('data-which', 'facebook')
			// 		.html('Facebook shares');

			// hover_window_container.append('div')
			// 	.classed('ST-hover-twitter', true)
			// 	.append('div')
			// 		.classed('ST-hover-section-title', true)
			// 		.attr('data-which', 'twitter')
			// 		.html('Twitter mentions');

			// hover_window_container.append('div')
			// 	.classed('ST-hover-spots-container', true)
			// 	.append('div')
			// 		.classed('ST-hover-section-title', true)
			// 		.attr('data-which', 'events')
			// 		.html('Events');

			// TODO, better updating
			first_run = false;

			function brushed(d) {
				xScale.domain(brush.empty() ? xScaleBrush.domain() : brush.extent());
				// TODO, wrap this up into an update function
				// noteCtnrLines.selectAll('.ST-note').attr('transform', function(d){ return 'translate(' + X(d) + ',0)'  })
				lineChartCtnr.selectAll('.ST-metric-line[data-group="a"] .ST-line').attr('d', function(d){ return lines['a'](d.values) });
				lineChartCtnr.selectAll('.ST-metric-line[data-group="b"] .ST-line').attr('d', function(d){ return lines['b'](d.values) });
				lineChartCtnr.select('.ST-x.ST-axis').call(xAxis);
				eventTimelineCntnr.selectAll('.ST-event-circle-g').attr('transform', function(d,i) { return 'translate('+(margin.left + xScale(d.timestamp))+',14)'; });
				var rect_g = eventTimelineCntnr.selectAll('.ST-event-rect-g').attr('transform', function(d) { return 'translate('+(xScale(d.timestamp[0]) + margin.left)+',1)' })
				rect_g.select('rect')
						.attr('width', function(d) { 
							return xScale(d.timestamp[1]) - xScale(d.timestamp[0]) 
						});

				rect_g.select('text')
						.attr('transform', function(d){
							var width = xScale(d.timestamp[1]) - xScale(d.timestamp[0]) 
							return 'translate('+width/2+','+(events_row_height*1.5)+')';
						});

				// calcTimeInts();
				// Report this out to the app.js
				var timestamp_range_unoffset  = xScale.domain().map(function(bound){
					return setTimezone(bound , null, null, 'Etc/UTC' ).unix()/1000;
				});
				onBrush(timestamp_range_unoffset, brush.empty());
			}

			function activateHover() { 
				follow_line_g.style('display', null);
				d3.selectAll('.ST-point').style('display', null); 
				hover_window_container.style('display', null);
			}

			function deactivateHover() { 
				// TODO clean up style of using cached selections vs reselecting
				follow_line_g.style('display', 'none');
				d3.selectAll('.ST-point').style('display', 'none'); 
				d3.selectAll('.ST-event-circle').classed('ST-highlighted', false); 
				hover_window_container.style('display', 'none');
			}

			function populateHoverWindow(hoverInfo){
				if (hoverInfo.metrics){
					hover_window_container.datum(hoverInfo);

					hover_window_container.select('.ST-hover-timestamp').html(function(d){
						return d.moment.format('"dddd, MMM D \'YY, h:mm a"');
					});

					var metrics = hover_window_container.selectAll('.ST-hover-metric-container').data(function(d){ return d.metrics; }),
							_metrics = metrics.enter();

					// Update
					metrics.select('.ST-hover-swatch')
						.style('background-color', function(d){
							return d.color;
						});

					metrics.select('.ST-hover-section-label')
						.html(function(d){
							return d.key.charAt(0).toUpperCase() + d.key.slice(1);
						})

					metrics.select('.ST-hover-section-value')
						.html(function(d){
							return addCommas(d.value);
						})

					// Enter new
					// Really only happens the first time
					var metric_container = _metrics.append('div')
						.classed('ST-hover-metric-container', true);

					metric_container.append('div')
						.classed('ST-hover-swatch', true)
						.style('background-color', function(d){
							return d.color;
						});

					metric_container.append('div')
						.classed('ST-hover-section-label', true)
						.html(function(d){
							return d.key.charAt(0).toUpperCase() + d.key.slice(1);
						});

					metric_container.append('div')
						.classed('ST-hover-section-value', true)
						.html(function(d){
							return addCommas(d.value);
						});
				}

			}

			function mousemove(d){
				var that = this,
						mouse_coords = d3.mouse(that);
				mouse_coords[0] = mouse_coords[0] - margin.left;

				var hover_info = setHoverInfoHighlightEvents.call(that, mouse_coords),
						mouse_x = mouse_coords[0];

				follow_line .attr('x1', mouse_x)
										.attr('x2', mouse_x);

				populateHoverWindow(hover_info);

				// Disable/enable hover display when hovering outside of chart range
				var x_scale_range = xScale.range();
				if (mouse_x > x_scale_range[0] && mouse_x < x_scale_range[1]){
					activateHover();
				} else {
					deactivateHover();
				}

			}

			// function highlightSpots(mouseCoords){

			// }

			function setHoverInfoHighlightEvents(mouseCoords){
				var mouse_x = mouseCoords[0],
						mouse_y = mouseCoords[1],
						data_val_at_mouse_x = xScale.invert(mouse_x),
						idx_at_svg_x = bisectDate(data, data_val_at_mouse_x, 1),
						d0 = data[idx_at_svg_x - 1],
						d1 = data[idx_at_svg_x],
						hover_data = {},
						pixel_window = 75;

				// Stash the date our mouse is at
				hover_data.moment = moment(data_val_at_mouse_x);

				// Get some data on the timeseries information
				if (d0 && d1){
					var d = data_val_at_mouse_x - d0.timestamp > d1.timestamp - data_val_at_mouse_x ? d1 : d0,
							d3_points = d3.selectAll('.ST-point'), // Cache this selection
							x_position = X(d); // From the data value we found by getting the one nearest the mouse_x position, figure out its exact x position so that we may put the point val at that X.

					// Layout the point at the appropriate x and y coordinates in the svg
					// Also grab some of its data and stash it in our mouseover object
					hover_data.metrics = [];
					d3_points.attr('transform', function(dd) { 
						var obj = {};
						var y_data_val = d[dd.name],
								y_coord = yScales[dd.group](y_data_val);

						obj.key = dd.name;
						obj.value = +y_data_val;
						obj.color = legend[dd.name].color;
						hover_data.metrics.push(obj);
						return 'translate(' + x_position + ',' + y_coord + ')';
					});
					hover_data.metrics.sort(function(a,b){
						return d3.descending(a.value, b.value);
					})
				}

				// Get the date for our other buckets of data in `spot_values`
				var spots_within_range = [];
				d3.select('.ST-categories')
					.selectAll('.ST-event-circle')
					.each(function(d){
						var d3_this = d3.select(this),
								category = d.category,
								x_position_of_spot = xScale(d.timestamp),
								within_range = x_position_of_spot > (mouse_x - pixel_window) && x_position_of_spot < (mouse_x + pixel_window);

						d3_this.classed('ST-highlighted', false);
						if (within_range){
							spots_within_range.push(d);
							d3_this.classed('ST-highlighted', true);
						}
					});

					// nest this object under categories
					hover_data.spots = d3.nest()
																.key(function(d){ return d.category })
																.entries(spots_within_range);

				return hover_data;


			}

			// function mousemove(d) {
			// 	var that = this;
			// 	var point_radius = 3,
			// 			mouse_x_buffer = -point_radius;
			// 	var m = d3.mouse(that)[0],
			// 			x0 = xScale.invert(m),
			// 			i = bisectDate(data, x0, 1),
			// 			d0 = data[i - 1],
			// 			d1 = data[i];
			// 	if (d0 && d1){
			// 		var d = x0 - d0.timestamp > d1.timestamp - x0 ? d1 : d0;
			// 		var point = d3.selectAll('.ST-point'),
			// 				x_position = X(d);
			// 		point.attr('transform', function(dd) { return 'translate(' + x_position + ',' + yScales[dd.group](d[dd.name]) + ')' });
			// 		point.select('text')
			// 			.text(function(dd) {return ppNumber(d[dd.name]) + ' ' + dd.display_name + ' ' + (legend[dd.name].metric || dd.name) })
			// 			// .attr('x', function(dd){ return (-mouse_x_buffer - this.getBBox().width) })
			// 			.attr('y', -point_radius*3.3)
			// 			.attr('x', function(dd){ return (x_position < chart_width - this.getBBox().width - mouse_x_buffer*2) ? mouse_x_buffer : (-mouse_x_buffer - this.getBBox().width) });
			// 	}
			// }


			function transformPromotionsIntoSpots(promos){
				var promos_copy = JSON.parse(JSON.stringify(promos));

				promos_copy = parseDates(promos_copy);

				promosMaxDate = d3.max(promos_copy, function(d) { 
					if (Array.isArray(d.timestamp)){
						return d3.max(d.timestamp) || new Date(0);
					} else {
						return d.timestamp; 
					}
				});

				if (!promosMaxDate) { promosMaxDate = new Date(0); }

				// Calc min of promos
				promosMinDate = d3.min(promos_copy, function(d) { 
					if (Array.isArray(d.timestamp)){
						return d3.min(d.timestamp) || new Date();
					} else {
						return d.timestamp; 
					}
				});


				promos_copy = promos_copy.map(function(promo){
					var type = 'discrete';
					if (Array.isArray(promo.timestamp)) {
						type = 'continuous';
					}
					promo.type = type;
					return promo;
				});

				var spots = {};

				if (promos_copy.length){
					spots = d3.nest()
											.key(function(d){ return d.type })
											.map(promos_copy);
				}

				// Return this in the same nested format as the others
				return [
					{
						key: 'Promot.',
						values: {
							discrete: spots.discrete || [],
							continuous: spots.continuous || []
						}
					}
				]
			}

			function transformEventsIntoSpots(evts){
				// If we had any not serializable elements in our data, laterz
				var events_copy = JSON.parse(JSON.stringify(evts));
				events_copy = parseDates(events_copy);

				eventsMaxDate = d3.max(events_copy, function(d) { return d.timestamp; }) || new Date(0);
				eventsMinDate = d3.min(events_copy, function(d) { return d.timestamp; }) || new Date();

				var abbreved_names = {
							achievement: 'achievem.'
						};

				// Now grab all the impact_tags and store them as top level info on the object
				// Turn this object inside out, copy parent attributes onto each impact_tag
				// These are no longer `evets` per se, bc one event can be represented multiple times.
				// They're more like spots.
				var spots = [];
				events_copy.forEach(function(evt){
					evt.impact_tags_full.forEach(function(impactTagFull){
						// Grab all the top level stuff on this object
						// And this impact tag

						var category = impactTagFull.category,
								pretty_category = impactTagFull.category;

						if (abbreved_names[category]) { pretty_category = abbreved_names[category]; }

						pretty_category = pretty_category.charAt(0).toUpperCase() + pretty_category.slice(1);


						var spot = {
							timestamp: evt.timestamp,
							event_name: evt.name,
							link: evt.link,
							text: evt.text,
							title: evt.title,
							description: evt.description,
							category: impactTagFull.category,
							pretty_category: pretty_category,
							level: impactTagFull.level,
							color: impactTagFull.color,
							tag_name: impactTagFull.name
						}
						spots.push(spot);
					});
				});

				var spotsByCategory = d3.nest()
									.key(function(d){ return d.pretty_category })
									.rollup(function(list){
										return {
											discrete: list,
											continuous: []
										}
									})
									.entries(spots);

				return spotsByCategory;
			}

		});
	}

	// function calcTimeInts(){
	// 	var time_arr = xScale.domain().map(function(d) { return d.getTime() } ),
	// 			steps = 5,
	// 			time_interval = (time_arr[1] - time_arr[0]) / steps,
	// 			ints = [];

	// 	d3.range(steps).forEach(function(step){
	// 		var how_many_intervals = time_interval*(step);
	// 		ints.push( new Date(time_arr[0] + how_many_intervals) )
	// 	})
	// 	ints.push(new Date(time_arr[1]))

	// 	xAxis.tickValues(ints);
	// }

	function parseDates(arr){
		var converted = arr.map(function(d) {

			if (Array.isArray(d.timestamp)) { 
				d.timestamp = d.timestamp.map(setTimezone);
			} else { 
				d.timestamp = setTimezone(d.timestamp);
			}

			return d;
		});

		return converted;
	}

	function setTimezone(utcTimestamp, index, list, timezoneRegion){
		var timezone_region = timezoneRegion || timezone;
		
		utcTimestamp = utcTimestamp*1000;
		var utc_moment = moment(utcTimestamp),
				user_timezone_moment = utc_moment.tz(timezone_region);

		return user_timezone_moment;
	}	

	// The x-accessor for the path generator; xScale ∘ xValue.
	function X(d) {
		return xScale(d.timestamp);
	}

	// The x-accessor for the path generator; yScale ∘ yValue.
	function Ya(d) {
		return yScales['a'](yValue(d));
	}

	function Yb(d) {
		return yScales['b'](yValue(d));
	}

	// The x-accessor for the brush path generator; xScale ∘ xValue.
	function XBrush(d) {
		return xScaleBrush(d.timestamp);
	}

	// The x-accessor for the brush path generator; yScale ∘ yValue.
	function YBrushA(d) {
		return yScalesBrush['a'](yValue(d));
	}

	function YBrushB(d) {
		return yScalesBrush['b'](yValue(d));
	}

	function extend(defaults, opts){
		for (var prop in opts){
			if (opts.hasOwnProperty(opts)){
				defaults[prop] = opts[prop];
			}
		}
		return defaults;
	}

	chart.margin = function(__) {
		if (!arguments.length) return margin;
		extend(margin, __);
		return chart;
	};

	chart.marginBrush = function(__) {
		if (!arguments.length) return marginBrush;
		extend(marginBrush, __);
		return chart;
	};

	// chart.x = function(__) {
	// 	if (!arguments.length) return xValue;
	// 	xValue = __;
	// 	return chart;
	// };

	chart.y = function(__) {
		if (!arguments.length) return yValue;
		yValue = __;
		return chart;
	};

	chart.legend = function(__) {
		if (!arguments.length) return legend;
		legend = __;
		return chart;
	};	

	chart.events = function(__){
		if (!arguments.length) return events;
		events = __;
		return chart;
	}

	chart.promotions = function(__){
		if (!arguments.length) return promotions;
		promotions = __;
		return chart;
	}
	chart.interpolate = function(__){
		if (!arguments.length) return interpolate;
		interpolate = __;
		return chart;
	}
	chart.onBrush = function(__){
		if (!arguments.length) return onBrush;
		onBrush = __;
		return chart;
	}
	chart.timezone = function(__){
		if (!arguments.length) return timezone;
		timezone = __;
		return chart;
	}


	chart.update = function(__){
		// TODO, instead of ditching redrawing the whole svg, trigger a d3 update and note redraw
		if (!arguments.length) { chart(selection); return chart };
		chart(__);
		return chart
	}

	window.addEventListener('resize', function(event){
		chart.update(selection);
	});

	return chart;
}