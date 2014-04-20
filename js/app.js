(function(){

	d3.csv('data/sp500.csv', drawChart)

	function drawChart(sp500){
		var formatDate = d3.time.format("%b %Y");

		d3.select('#st-chart')
			.datum(sp500)
	  .call(timeSeriesChart()
	    .x(function(d) { return formatDate.parse(d.date); })
	    .y(function(d) { return [+d.price, +d.sale]; }))
	  	// .on('mouseover', function(d){console.log(d)});
		
	}


	// var $ctnr = $('#st-chart'),
	// 		ctnr_width = $ctnr.width(),
	// 		ctnr_height = $ctnr.height();

	// console.log(ctnr_width, ctnr_height);

	// var margin = {top: 10, right: 0, bottom: ctnr_height / 3, left: 40},
	//     margin2 = {top: (ctnr_height * 8 / 10), right: 0, bottom: 20, left: 40},
	//     width = ctnr_width - margin.left - margin.right,
	//     height = ctnr_height - margin.top - margin.bottom,
	//     height2 = ctnr_height - margin2.top - margin2.bottom;

	// var parseDate = d3.time.format("%b %Y").parse,
 //    	bisectDate = d3.bisector(function(d) { return d.date; }).left;

 //  var x = d3.time.scale().range([0, width]),
	//     x2 = d3.time.scale().range([0, width]),
	//     y = d3.scale.linear().range([height, 0]),
	//     y2 = d3.scale.linear().range([height2, 0]);

	// var xAxis = d3.svg.axis().scale(x).orient("bottom"),
	//     xAxis2 = d3.svg.axis().scale(x2).orient("bottom"),
	//     yAxis = d3.svg.axis().scale(y).orient("left");

	// var brush = d3.svg.brush()
	//     .x(x2)
	//     .on("brush", brushed);

	// var line = d3.svg.line()
 //    .x(function(d) { return x(d.date); })
 //    .y(function(d) { return y(d.price); });

	// var line2 = d3.svg.line()
 //    .x(function(d) { return x2(d.date); })
 //    .y(function(d) { return y2(d.price); });

	// var svg = d3.select("#st-chart").append("svg")
	//     .attr("width", width + margin.left + margin.right)
	//     .attr("height", height + margin.top + margin.bottom);

	// svg.append("defs").append("clipPath")
	//     .attr("id", "clip")
	//   .append("rect")
	//     .attr("width", width)
	//     .attr("height", height);

	// var focus = svg.append("g")
	//     .attr("class", "focus")
	//     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// var context = svg.append("g")
	//     .attr("class", "context")
	//     .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

 //  var point = svg.append("g")
 //    .attr("class", "point")
 //    .style("display", "none");

 //  point.append("circle")
 //      .attr("r", 4.5);

 //  point.append("text")
 //      .attr("x", 9)
 //      .attr("dy", ".35em");




	// d3.csv("data/sp500.csv", type, function(error, data) {
	//   x.domain(d3.extent(data.map(function(d) { return d.date; })));
	//   y.domain([0, d3.max(data.map(function(d) { return d.price; }))]);
	//   x2.domain(x.domain());
	//   y2.domain(y.domain());

	//   focus.append("path")
	//       .datum(data)
	//       .attr("class", "line")
	//       .style("clip-path", "url(#clip)")
	//       .attr("d", line)
	// 			.on("mouseover", function() { point.style("display", null); })
	//       .on("mouseout", function() { point.style("display", "none"); })
	//       .on("mousemove", mousemove);

	//   focus.append("g")
	//       .attr("class", "x axis")
	//       .attr("transform", "translate(0," + height + ")")
	//       .call(xAxis);

	//   focus.append("g")
	//       .attr("class", "y axis")
	//       .call(yAxis);

	//   context.append("path")
	//       .datum(data)
	//       .attr("class", "line")
	//       .attr("d", line2);

	//   context.append("g")
	//       .attr("class", "x axis")
	//       .attr("transform", "translate(0," + height2 + ")")
	//       .call(xAxis2);

	//   context.append("g")
	//       .attr("class", "x brush")
	//       .call(brush)
	//     .selectAll("rect")
	//       .attr("y", -6)
	//       .attr("height", height2 + 7);

	//   function mousemove() {
	//     var x0 = x.invert(d3.mouse(this)[0]),
	//         i = bisectDate(data, x0, 1),
	//         d0 = data[i - 1],
	//         d1 = data[i],
	//         d = x0 - d0.date > d1.date - x0 ? d1 : d0;
	//     point.attr("transform", "translate(" + (x(d.date) + margin.left) + "," + (y(d.price) + margin.top) + ")");
	//     point.select("text").text('(' + d.date + ') ' + d.price);
	//   }

	// });

	// function brushed() {
	//   x.domain(brush.empty() ? x2.domain() : brush.extent());
	//   focus.select(".line").attr("d", line);
	//   focus.select(".x.axis").call(xAxis);
	// }


	// function type(d) {
	//   d.date = parseDate(d.date);
	//   d.price = +d.price;
	//   return d;
	// }


}).call(this);