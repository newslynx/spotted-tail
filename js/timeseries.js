function timeSeriesChart() {
  // TODO, hover point, multiple lines
  var dimensions = {width: 700, height: 300},
      margin,
      marginBrush,
      chart_width,
      chart_width_brush,
      chart_height,
      chart_height_brush,
      xValue,
      yValue,
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
    selection.each(function(data, idx) {

      // Define the width based on the dimensions of the input container
      var ctnr = document.getElementById(selection[idx][0].id);
      chart.width(ctnr.offsetWidth);
      chart.height(ctnr.offsetHeight);

      margin = {top: 10, right: 0, bottom: (dimensions.height/3), left: 40};
      marginBrush = {top: (dimensions.height * .8), right: (dimensions.width*.3), bottom: 20, left: 40};
      chart_width = dimensions.width - margin.left - margin.right;
      chart_width_brush = dimensions.width - marginBrush.left - marginBrush.right;
      chart_height = dimensions.height - margin.top - margin.bottom;
      chart_height_brush = dimensions.height - marginBrush.top - marginBrush.bottom;

      // Convert data to standard representation greedily;
      // this is needed for nondeterministic accessors.
      data = data.map(function(d, i) {
        var dd = [xValue(d)];

        if ( isArray(yValue(d)) ) {
          yValue(d).forEach(function(yy){ dd.push(yy) }); 
        } else {
          dd.push(yValue(d))
        }
        return dd;
      });

      var x_domain = d3.extent(data, function(d) { return d[0]; }),
          y_domain = [0, d3.max(data, function(d) { return Math.max.apply(null, d.slice(1, d.length))  })];

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

      // Select the svg element
      var svg = d3.select(this).selectAll("svg").data([data]).enter().append("svg");

      // Clipping path
      svg.append("defs").append("clipPath")
          .attr("id", "clip")
        .append("rect")
          .attr("width", chart_width)
          .attr("height", chart_height);

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
      brushCtnr.append('g').attr('class', 'x brusher').call(brush.on("brush", brushed)).selectAll("rect").attr("y", -6).attr("height", chart_height_brush + 7);
      brushCtnr.append('g').attr('class', 'x axis');

      // Update the outer dimensions to the full dimensions including the margins.
      svg .attr("width", dimensions.width)
          .attr("height", dimensions.height);

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

  function isArray(testVar){
    return Object.prototype.toString.call( testVar ) == '[object Array]';
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
    if (!arguments.length) return dimensions.width;
    dimensions.width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return dimensions.height;
    dimensions.height = _;
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