function timeSeriesChart() {
  var margin = {top: 10, right: 0, bottom: 90, left: 40},
      marginBrush = {top: 240, right: 250, bottom: 20, left: 40},
      width = 760 - margin.left - margin.right,
      widthBrush = 760 - marginBrush.left - marginBrush.right,
      height = 300 - margin.top - margin.bottom,
      heightBrush = 300 - marginBrush.top - marginBrush.bottom,
      xValue = function(d) { return d[0]; },
      yValue = function(d) { return d[1]; },
      xScale = d3.time.scale(),
      xScaleBrush = d3.time.scale(),
      yScale = d3.scale.linear(),
      yScaleBrush = d3.scale.linear(),
      xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickSize(6, 0),
      yAxis = d3.svg.axis().scale(yScale).orient("left"),
      xAxisBrush = d3.svg.axis().scale(xScaleBrush).orient("bottom").tickSize(6, 0),
      // area = d3.svg.area().x(X).y1(Y),
      line = d3.svg.line().x(X).y(Y)
      lineBrush = d3.svg.line().x(XBrush).y(YBrush)
      brush = d3.svg.brush().x(xScaleBrush);

  function chart(selection) {
    selection.each(function(data) {

      // Convert data to standard representation greedily;
      // this is needed for nondeterministic accessors.
      data = data.map(function(d, i) {
        return [xValue.call(data, d, i), yValue.call(data, d, i)];
      });

      // Update the x-scale.
      xScale
          .domain(d3.extent(data, function(d) { return d[0]; }))
          .range([0, width]);

      // Update the y-scale.
      yScale
          .domain([0, d3.max(data, function(d) { return d[1]; })])
          .range([height, 0]);

      // Update the x-scale.
      xScaleBrush
          .domain(d3.extent(data, function(d) { return d[0]; }))
          .range([0, widthBrush]);

      // Update the y-scale.
      yScaleBrush
          .domain([0, d3.max(data, function(d) { return d[1]; })])
          .range([heightBrush, 0]);

      // Select the svg element, if it exists.
      var svg = d3.select(this).selectAll("svg").data([data]).enter().append("svg");

      console.log(width, height)
      // Clipping path
      svg.append("defs").append("clipPath")
          .attr("id", "clip")
        .append("rect")
          .attr("width", width)
          .attr("height", height);

      // Otherwise, create the skeletal chart.
      // Lines
      var lineChartCtnr = svg.append("g")
                            .attr('class', 'line-g')
                            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // line with clipping path, axes
      lineChartCtnr.append('path').attr('class','line').style("clip-path", "url(#clip)");
      lineChartCtnr.append('g').attr('class', 'y axis');
      lineChartCtnr.append('g').attr('class', 'x axis');

      // Brush container
      var brushCtnr     = svg.append("g")
                            .attr('class', 'brush')
                            .attr("transform", "translate(" + marginBrush.left + "," + marginBrush.top + ")");
      // line, brusher, axes
      brushCtnr.append('path').attr('class','line');
      brushCtnr.append('g').attr('class', 'x brusher').call(brush.on("brush", brushed)).selectAll("rect").attr("y", -6).attr("height", heightBrush + 7);
      brushCtnr.append('g').attr('class', 'x axis');

      // Update the outer dimensions to the full dimensions including the margins.
      svg .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom);

      // Update the line path.
      lineChartCtnr.select(".line")
          .attr("d", line);/*
          .on("mouseover", function() { point.style("display", null); })
          .on("mouseout", function() { point.style("display", "none"); })
          .on("mousemove", mousemove);*/

      // And its xAxis
      lineChartCtnr.select('.x.axis')
          .attr("transform", "translate(0," + yScale.range()[0] + ")")
          .call(xAxis);

      // And the y
      lineChartCtnr.select('.y.axis')
          .call(yAxis);

      // Update the brush path
      brushCtnr.select(".line")
          .attr("d", lineBrush);

      // And its xAxis
      brushCtnr.select('.x.axis')
          .attr("transform", "translate(0," + yScaleBrush.range()[0] + ")")
          .call(xAxisBrush);

      function brushed() {
        xScale.domain(brush.empty() ? xScaleBrush.domain() : brush.extent());
        lineChartCtnr.select(".line").attr("d", line);
        lineChartCtnr.select(".x.axis").call(xAxis);
      }

    });
  }

  // The x-accessor for the path generator; xScale ∘ xValue.
  function X(d) {
    return xScale(d[0]);
  }

  // The x-accessor for the path generator; yScale ∘ yValue.
  function Y(d) {
    return yScale(d[1]);
  }

  // The x-accessor for the brush path generator; xScale ∘ xValue.
  function XBrush(d) {
    return xScaleBrush(d[0]);
  }

  // The x-accessor for the brush path generator; yScale ∘ yValue.
  function YBrush(d) {
    return yScaleBrush(d[1]);
  }

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.x = function(_) {
    if (!arguments.length) return xValue;
    xValue = _;
    return chart;
  };

  chart.y = function(_) {
    if (!arguments.length) return yValue;
    yValue = _;
    return chart;
  };

  return chart;
}