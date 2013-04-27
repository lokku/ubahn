var data, draw_line, getMaxPrice, height, max_price, padding, svg, transition, width;

width = 650;

height = 300;

padding = 20;

data = {};

transition = 1500;

svg = d3.select("#graph").append("svg").attr("height", height).attr("width", width);

max_price = 0;

d3.json("data/london.json", function(json_data) {
  data = json_data;
  d3.select("#lines").selectAll(".line").data(data.lines).enter().append("a").attr("class", "line").text(function(d) {
    return d.name;
  }).style("background-color", function(d) {
    return d['background-color'];
  }).style("color", function(d) {
    return d.color;
  }).attr("href", "#").on("click", function(d, i) {
    console.log("click");
    return draw_line(i, "1");
  });
  d3.select("#lines").selectAll(".line").data(data.lines).attr("class", "line").text(function(d) {
    return d.name;
  }).style("background-color", function(d) {
    return d['background-color'];
  });
  return d3.select("#lines").selectAll(".line").data(data.lines).exit().remove();
});

getMaxPrice = function(category) {
  var d, dd, m, station, _i, _j, _len, _len2, _ref, _ref2;
  dd = [];
  m = 0;
  _ref = _.values(data.stations);
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    station = _ref[_i];
    _ref2 = station.prices;
    for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
      d = _ref2[_j];
      if (d.category === category && d.price > m) m = d.price;
    }
  }
  return m;
};

draw_line = function(line_index, category) {
  var circles, i, initialLineGenerator, line, lineGenerator, path, st, stations, x, y, yAxis;
  line = data.lines[line_index];
  max_price = getMaxPrice(category);
  stations = [
    (function() {
      var _len, _ref, _results;
      _ref = data.lines[line_index].stations;
      _results = [];
      for (i = 0, _len = _ref.length; i < _len; i++) {
        st = _ref[i];
        _results.push({
          'index': i,
          'd': data.stations[st],
          'prices': _.find(data.stations[st].prices, function(d) {
            return d.category === category;
          })
        });
      }
      return _results;
    })()
  ];
  console.log(stations);
  x = d3.scale.linear().domain([0, 45]).rangeRound([padding, width - padding]);
  y = d3.scale.linear().domain([0, max_price]).rangeRound([height - padding, padding]);
  yAxis = d3.svg.axis().scale(y).tickSize(max_price / 5).tickSubdivide(false);
  initialLineGenerator = d3.svg.line().x(function(st) {
    return x(st.index);
  }).y(function(st) {
    return y(0);
  });
  lineGenerator = d3.svg.line().x(function(st) {
    return x(st.index);
  }).y(function(st) {
    return y(st.prices.price);
  });
  path = svg.selectAll(".path").data(stations).style("stroke", data.lines[line_index]['background-color']);
  path.transition().duration(transition).attr("d", function(d) {
    return lineGenerator(d);
  });
  path.enter().append("path").attr("d", function(d) {
    return initialLineGenerator(d);
  }).style("stroke", data.lines[line_index]['background-color']).attr("class", "path").transition().duration(transition).attr("d", function(d) {
    return lineGenerator(d);
  });
  path.exit().remove();
  circles = svg.selectAll(".stop").data(stations[0]);
  circles.transition().duration(transition).attr("cx", function(st) {
    return x(st.index);
  }).attr("cy", function(st) {
    return y(st.prices.price);
  });
  circles.enter().append("circle").attr("class", "stop").attr("r", 0).attr("cx", function(st) {
    return x(st.index);
  }).attr("cy", function(st) {
    return y(st.prices.price);
  }).transition().duration(transition).attr("r", 4);
  return circles.exit().remove();
};
