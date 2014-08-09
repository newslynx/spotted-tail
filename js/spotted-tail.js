function spottedTail() {

	'use strict'

	var selection;

	var customTimeFormat = d3.time.format.multi([
		['.%L', function(d) { return d.getMilliseconds(); }],
		[':%S', function(d) { return d.getSeconds(); }],
		['%I:%M', function(d) { return d.getMinutes(); }],
		['%I %p', function(d) { return d.getHours(); }],
		['%a %d', function(d) { return d.getDay() && d.getDate() != 1; }],
		['%b %d', function(d) { return d.getDate() != 1; }],
		['%b', function(d) { return d.getMonth(); }],
		['%Y', function() { return true; }]
	]);

	var dimensions = {},
			margin = {},
			marginBrush = {},
			marginEvents = {},
			events_width,
			chart_width,
			chart_width_brush,
			chart_height,
			chart_height_brush,
			events_row_height,
			xValue,
			yValue,
			legend,
			// notes,
			eventSchema,
			events,
			color = d3.scale.category10(),
			xScale = d3.time.scale(),
			xScaleBrush = d3.time.scale(),
			yScale = d3.scale.linear(),
			yScaleBrush = d3.scale.linear(),
			xAxis = d3.svg.axis().scale(xScale).orient('bottom').tickSize(6, 0).tickFormat(customTimeFormat),
			yAxis = d3.svg.axis().scale(yScale).orient('left').ticks(3).tickFormat(d3.format('s')),
			xAxisBrush = d3.svg.axis().scale(xScaleBrush).orient('bottom'),
			line = d3.svg.line().x(X).y(Y),
			lineBrush = d3.svg.line().x(XBrush).y(YBrush),
			brush = d3.svg.brush().x(xScaleBrush),
			bisectDate = d3.bisector(function(d) { return d.date; }).left,
			ppDate = function(dObj) { return dObj.toDateString() };


	function chart(selection_) {
		selection = selection_;
		selection.each(function(data, idx) {
			d3.select(this).html('');
			addButtons(this);
			// Define the width based on the dimensions of the input container
			var ctnr = document.getElementById(selection[idx][0].id);

			dimensions = {width: ctnr.offsetWidth, height: ctnr.offsetHeight};

			margin = extend({top: 10, right: 0, bottom: 0, left: 100}, margin);

			marginEvents = extend({top: margin.top, top_buffer: 35, right: 0, bottom: 20, left: margin.left}, marginBrush); // topBuffer is for the bottom axis
			marginBrush = extend({top: (dimensions.height * .9), right: 0, bottom: 0, left: margin.left}, marginBrush);
			chart_width = dimensions.width - margin.left - margin.right;
			chart_width_brush = dimensions.width - marginBrush.left - marginBrush.right;
			chart_height = .35;
			chart_height = chart_height*(dimensions.height - margin.top - margin.bottom);
			chart_height_brush = dimensions.height - marginBrush.top - marginBrush.bottom;
			events_row_height = .3*chart_height;
			data = parseDates(data);
			// notes = parseDates(notes);
			events = parseDates(events);

			// Set our value categories to everything except for things called date
			color.domain(Object.keys(legend));

			var metrics = color.domain().map(function(name) {
					return { 
						name: name,
						values: data.map(function(d) {
							return {date: d.date, count: +d[name]};
						})
					}
			});

			var x_domain = d3.extent(data, function(d) { return d.date; }),
					y_domain = [0, 
						d3.max(metrics, function(c) { return d3.max(c.values, function(v) { return v.count; }); })
					];

			// Update the x-scale.
			xScale
					.domain(x_domain)
					.range([0, chart_width]);

			// Update the y-scale.
			yScale
					.domain(y_domain)
					.range([chart_height, 0]);

			// Update the x-scale.
			xScaleBrush
					.domain(x_domain)
					.range([0, chart_width_brush]);

			// Update the y-scale.
			yScaleBrush
					.domain(y_domain)
					.range([chart_height_brush, 0]);

			// Append the svg element
			var svg = d3.select(this).append('svg').attr('class', 'ST-canvas');

			// Clipping path
			svg.append('defs').append('clipPath')
					.attr('id', 'ST-clip')
				.append('rect')
					.attr('width', chart_width)
					.attr('height', dimensions.height);
					console.log(dimensions.height)

			// Lines
			var lineChartCtnr = svg.append('g')
														.classed('ST-line-g', true)
														.classed('ST-container', true)
														.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
			// For mouseevents										 
			lineChartCtnr.append('rect')
					.attr('width', chart_width)
					.attr('height', chart_height)
					.attr('fill', 'none')
					.attr('pointer-events', 'all')
					.on('mouseover', function() {d3.selectAll('.ST-point').style('display', null); })
					.on('mouseout', function() { d3.selectAll('.ST-point').style('display', 'none'); })
					.on('mousemove', mousemove)

			// line with clipping path, axes
			lineChartCtnr.append('g').attr('class', 'ST-y ST-axis');
			lineChartCtnr.append('g').attr('class', 'ST-x ST-axis');

			// Brush container
			var brushCtnr		 = svg.append('g')
														.classed('ST-brush', true)
														.classed('ST-container', true)
														.attr('transform', 'translate(' + marginBrush.left + ',' + marginBrush.top + ')')

			// line, brusher, axes
			// brushCtnr.append('path').attr('class','metric-line');
			brushCtnr.append('g').attr('class', 'ST-x ST-brusher').call(brush.on('brush', brushed)).selectAll('rect').attr('y', -6).attr('height', chart_height_brush + 7);
			brushCtnr.append('g').attr('class', 'ST-x ST-axis');

			// Events container
			var eventsCntnr  = svg.append('g')
														.classed('ST-events', true)
														.classed('ST-container', true)
														.attr('transform', 'translate(0,' + (chart_height + marginEvents.top + marginEvents.top_buffer) + ')');
														// .attr('transform', 'translate(' + marginEvents.left + ',' + (chart_height + marginEvents.top + marginEvents.top_buffer) + ')');

			// Update the outer dimensions to the full dimensions including the margins.
			svg .attr('width', dimensions.width)
					.attr('height', dimensions.height)


			// Update the line path.
			lineChartCtnr.selectAll('.ST-metric-line')
					.data(metrics)
				.enter().append('g')
					.attr('class', 'ST-metric-line')

			lineChartCtnr.selectAll('.ST-metric-line')
				.append('path')
					.attr('class', 'ST-line')
					.style('clip-path', 'url(#ST-clip)')
					.attr('d', function(d) { return line(d.values); })
					.style('stroke', function(d) { return legend[d.name].color || color(d.name); });

			// And its xAxis
			lineChartCtnr.select('.ST-x.ST-axis')
					.attr('transform', 'translate(0,' + yScale.range()[0] + ')')
					.call(xAxis);

			// Tuck the first one in by half its width
			// You could also set `text-anchor` to `start` but that wasn't working
			lineChartCtnr.select('.ST-x.ST-axis')
					.selectAll('.tick text')
						.attr('x', function(d,i){ return (i == 0) ? this.getBBox().width/2 : 0 });
						// .attr('text-anchor', function(d,i){ return (i == 0) ? 'start' : 'middle'})

			// Extend the line all the way to the left
			lineChartCtnr.select('.ST-x.ST-axis')
					.select('.domain')
					.attr('d', 'M'+(-1*margin.left)+',0V0H'+(chart_width + margin.left)+'V0')

			// And the y
			lineChartCtnr.select('.ST-y.ST-axis')
					.call(yAxis);

			// Tuck zero up above the line
			lineChartCtnr.select('.ST-y.ST-axis')
					.selectAll('.tick text')
						.attr('y', function(d,i){ return (i == 0) ? -1*this.getBBox().height/2 : 0 });

			// And focal points
			lineChartCtnr.selectAll('.ST-metric-line')
					.append('g')
						.attr('class', 'ST-point')
						.style('display', 'none')
					.append('circle')
						.attr('r', 3);

			// And text components
			lineChartCtnr.selectAll('.ST-point')
					.append('text')
						.attr('dy', '.35em');

			// Events container, let's use `_` suffix to mean the enter selection
			var eventTimelineCntnr_ = eventsCntnr.selectAll('.ST-event-timeline')
				.data(eventSchema).enter();

			var eventTimelineCntnr = eventTimelineCntnr_.append('g')
				.classed('ST-event-timeline', true)
				.attr('transform', function(d, i) { return 'translate(0,' + (i*events_row_height) + ')' })
			
			eventTimelineCntnr.append('line')
				.classed('ST-event-timeline-hr', true)
				.attr('x1', 0)
				.attr('x2', chart_width + margin.left)
				.attr('transform', 'translate(0,' + 0 + ')');

			eventTimelineCntnr.append('text')
				.attr('text-anchor', 'end')
				.classed('ST-event-timeline-name', true)
				.html(function(d) { return d.name })
				.attr('transform', function(d) { return 'translate('+(margin.left - 10)+','+ ( events_row_height/2 + this.getBBox().height/4 ) +')' }); // -10 to align with the axis numbers

			// Add all the events to this row
			var eventItems = eventTimelineCntnr.append('g')
				.classed('ST-events', true)
				.selectAll('.ST-timeline-event')
				.data(function(d) { return events.filter(function(f){ return f.tags.some(function(g) { return g.category.indexOf(d.name.toLowerCase()) != -1 }) }) }).enter();

			eventItems.append('circle')
				.classed('ST-event-circle', true)
				.style('clip-path', 'url(#ST-clip)')
				.attr('r', 4.5)
				.attr('transform', function(d) { return 'translate('+(margin.left)+',0)' })
				.attr('cx', function(d){ return xScale(d.date) })
				.attr('cy', events_row_height/2 );


			// Update the brush path
			brushCtnr.selectAll('.ST-metric-line')
					.data(metrics)
				.enter().append('g')
					.attr('class', 'ST-metric-line');
			
			// Add the line series
			brushCtnr.selectAll('.ST-metric-line')
				.append('path')
					.attr('class', 'ST-line')
					.attr('d', function(d) { return lineBrush(d.values); })
					.style('stroke', function(d) { return legend[d.name].color || color(d.name); })
			
			brushCtnr.selectAll('.ST-event-circle').data(events).enter()
						.append('circle')
						.classed('.ST-event-circle', true)
						.attr('r', 4.5)
						.attr('transform', function(d) { return 'translate(0,'+(yScaleBrush.range()[0] - this.getBBox().height) +')' })
						.attr('cx', function(d){ return xScale(d.date) });

			// And its xaxis
			// brushCtnr.select('.ST-x.ST-axis')
			// 		.attr('transform', 'translate(0,' + yScaleBrush.range()[0] + ')')
			// 		.call(xAxisBrush);

			// Note container
			/*var noteCtnrLines		 = lineChartCtnr
														.append('g')
														.classed('ST-notes', true)
														.style('clip-path', 'url(#ST-clip)');

			var noteLines = noteCtnrLines.selectAll('.ST-note')
					.data(notes)
				.enter().append('g')
					.attr('class', 'ST-note')
					.attr('data-note-type', function(d) { return d.type.join('|') })
					.attr('transform', function(d){ return 'translate(' + X(d) + ',0)'  })

			noteLines.append('line')
				.attr('y1', 0)
				.attr('y2', chart_height)
				.attr('stroke-dasharray', '5,2')

			noteLines.append('text')
				.text(function(d) { return d.text } )
				.attr('dx', '.32em')
				.attr('dy', '.8em')
				.style('text-anchor', 'start')
				.style('display', 'none')

			noteLines.append('rect')
				.attr('width', 10)
				.attr('height', chart_height)
				.attr('data-uid', function(d) { return d.uid } )
				.attr('transform', 'translate(-5,0)') // Make this half the width so it's centered within the line
				.on('mouseover', function(d){ noteTooltip(this, true) })
				.on('mouseout', function(d){ noteTooltip(this, false) })
				.on('click', function() {console.log('do something')}); // TODO


			// Note container for brusher
			var noteCtnrBrush		 = brushCtnr
														.append('g')
														.classed('ST-notes', true);

			var noteBrush = noteCtnrBrush.selectAll('.ST-note')
					.data(notes)
				.enter().append('g')
					.attr('class', 'ST-note')
					.attr('data-note-type', function(d) { return d.type })
					.attr('transform', function(d){ return 'translate(' + XBrush(d) + ',0)'  })

			noteBrush.append('line')
				.attr('y1', 0)
				.attr('y2', yScaleBrush.range()[0])
				.attr('stroke-dasharray', '5,2')*/

			// noteLines.append('text')
			// 	.text(function(d) { return d.text } )
			// 	.attr('dx', '.32em')
			// 	.attr('dy', '.8em')
			// 	.style('text-anchor', 'start')
			// 	.style('display', 'none')

			// noteLines.append('rect')
			// 	.attr('width', 10)
			// 	.attr('height', yScaleBrush.range()[0])
			// 	.attr('data-uid', function(d) { return d.uid } )
			// 	.attr('transform', 'translate(-5,0)') // Make this half the width so it's centered within the line
			// 	.on('mouseover', function(d){ noteTooltip(this, true) })
			// 	.on('mouseout', function(d){ noteTooltip(this, false) })
			// 	.on('click', function() {console.log('do something')}); // TODO

			function noteTooltip(el, isActive){
				d3.select(el.parentNode).classed('ST-active', isActive);
			}

			function brushed(d) {
				xScale.domain(brush.empty() ? xScaleBrush.domain() : brush.extent());
				// TODO, wrap this up into an update function
				// noteCtnrLines.selectAll('.ST-note').attr('transform', function(d){ return 'translate(' + X(d) + ',0)'  })
				lineChartCtnr.selectAll('.ST-metric-line .ST-line').attr('d', function(d){ return line(d.values) });
				lineChartCtnr.select('.ST-x.ST-axis').call(xAxis);
				eventTimelineCntnr.selectAll('circle').attr('cx', function(d) { return xScale(d.date) });
			}

			function mousemove(d) {
				var that = this;
				var mouse_buffer = 9;
				var m = d3.mouse(that)[0],
						x0 = xScale.invert(m),
						i = bisectDate(data, x0, 1),
						d0 = data[i - 1],
						d1 = data[i];
				var d = x0 - d0.date > d1.date - x0 ? d1 : d0;
				var point = d3.selectAll('.ST-point');
				point.attr('transform', function(dd) {return 'translate(' + X(d) + ',' + yScale(d[dd.name]) + ')' });
				point.select('text')
					.text(function(dd) { return d[dd.name] + ' ' + (legend[dd.name].metric || dd.name) })
					.attr('x', function(dd){ return (m < chart_width - this.getBBox().width - mouse_buffer*2) ? mouse_buffer : (-mouse_buffer - this.getBBox().width) });
			}

		});
	}

	function isArray(testVar){
		return Object.prototype.toString.call( testVar ) == '[object Array]';
	}

	function parseDates(arr){
		// var uid = 0
		arr.forEach(function(d, i) {
			if (typeof d.date == 'string') d.date = xValue(d);
			// d.uid = 'a'+uid;
			// uid++
		});
		return arr
	}

	function addButtons(container){
		var noteBtns = d3.select(container).append('div')
			.classed('ST-note-btns', true).selectAll('buttons')
			.data(['note','event']);

		noteBtns.enter()
			.append('button')
			.html(function(d) { return '+ ' + d })
			.on('click', function(d) { handleBtnClick(d.name) })
	}

	function handleBtnClick(type){
		// Show different modal templates based on the button click
		var new_note = 		{
			date: 'Sep 2009',
			text: 'An added note',
			type: ['note']
		}

		// notes.push(new_note);
		chart.update();
	}

	// The x-accessor for the path generator; xScale ∘ xValue.
	function X(d) {
		return xScale(d.date);
	}

	// The x-accessor for the path generator; yScale ∘ yValue.
	function Y(d) {
		return yScale(yValue(d));
	}

	// The x-accessor for the brush path generator; xScale ∘ xValue.
	function XBrush(d) {
		return xScaleBrush(d.date);
	}

	// The x-accessor for the brush path generator; yScale ∘ yValue.
	function YBrush(d) {
		return yScaleBrush(yValue(d));
	}

	function extend(defaults, opts){
		for (var prop in opts){
			defaults[prop] = opts[prop]
		}
		return defaults
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

	chart.x = function(__) {
		if (!arguments.length) return xValue;
		xValue = __;
		return chart;
	};

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

	// chart.notes = function(__){
	// 	if (!arguments.length) return notes;
	// 	notes = __;
	// 	return chart
	// }

	// chart.addNote = function(__){
	// 	if (!arguments.length) return notes;
	// 	notes.push(__);
	// 	return chart
	// }

	chart.events = function(__){
		if (!arguments.length) return events;
		events = __;
		return chart;
	}

	chart.eventSchema = function(__){
		if (!arguments.length) return eventSchema;
		eventSchema = __;
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