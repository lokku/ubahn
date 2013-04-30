var active_cat, categoryText, data, draw_line, getMaxPrice, graph, height, hideLabel, intf, is_label_hovered, label, left_padding, max_price, padding, renderCategories, showLabel, svg, text_padding, transition, width, xAxis, yAxis;

width = 750;

height = 300;

padding = 30;

left_padding = 80;

text_padding = 10;

data = {};

transition = 800;

active_cat = "1";

is_label_hovered = false;

svg = d3.select("#graph").append("svg").attr("height", height).attr("width", width);

graph = svg.append("g").attr("class", "graph");

label = svg.append("g").attr("class", "label").on("mouseover", function() {
  return is_label_hovered = true;
}).on("mouseout", function() {
  is_label_hovered = false;
  return _.delay(hideLabel, 300);
});

label.append("rect").attr("class", "background").attr("x", 0).attr("y", 0);

label.append("text").attr("class", "header").attr("y", text_padding).attr("x", text_padding);

label.append("text").attr("class", "price").attr("x", text_padding);

label.append("a").attr("class", "link").attr("target", "_blank").attr("href", "test").append("text").attr("x", text_padding).text("See the list of properties");

xAxis = yAxis = d3.scale.linear();

intf = function(v) {
  return data.currency + d3.format(",.0f")(v / 1000) + "k";
};

categoryText = function(price, cat) {
  return intf(price) + " for " + cat + " bedroom flat";
};

renderCategories = function(line_index) {
  var cats;
  cats = d3.select("#categories").selectAll(".category").data(["1", "2", "3", "4", "5"]).on("click", function(d) {
    return draw_line(line_index, d);
  }).text(function(d) {
    var a;
    a = d + " bed";
    if (d !== "1") a = a + "s";
    return a;
  }).attr("class", function(d) {
    if (d === active_cat) {
      return "active category";
    } else {
      return "category";
    }
  });
  cats.enter().append("a").attr("href", "#").attr("class", function(d) {
    if (d === active_cat) {
      return "active category";
    } else {
      return "category";
    }
  }).on("click", function(d) {
    return draw_line(line_index, d);
  }).text(function(d) {
    var a;
    a = d + " bed";
    if (d !== "1") a = a + "s";
    return a;
  });
  return true;
};

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
    return draw_line(i, active_cat);
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
  var axis, circles, i, initialLineGenerator, line, lineGenerator, path, st, stations, x, y;
  active_cat = category;
  is_label_hovered = false;
  hideLabel();
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
  x = d3.scale.linear().domain([0, 45]).rangeRound([left_padding, width - padding]);
  y = d3.scale.linear().domain([0, max_price]).rangeRound([height - padding, padding]);
  yAxis = d3.svg.axis().scale(y).ticks(5).tickSubdivide(false).orient("left").tickFormat(intf);
  axis = graph.selectAll(".axis").data([1]);
  axis.enter().append("svg:g").attr("class", "axis").attr("transform", "translate(" + (left_padding - 10) + ",0)").call(yAxis);
  axis.call(yAxis);
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
  path = graph.selectAll(".path").data(stations).style("stroke", data.lines[line_index]['background-color']);
  path.transition().duration(transition).attr("d", function(d) {
    return lineGenerator(d);
  });
  path.enter().append("path").attr("d", function(d) {
    return initialLineGenerator(d);
  }).style("stroke", data.lines[line_index]['background-color']).attr("class", "path").transition().duration(transition).attr("d", function(d) {
    return lineGenerator(d);
  });
  path.exit().remove();
  circles = graph.selectAll(".stop").data(stations[0]);
  circles.attr("xlink:href", function(st) {
    return st.prices.url;
  }).select("circle").on("mouseover", function(st) {
    d3.select(this).transition().duration(500).attr("r", 8);
    return showLabel(st, x(st.index), y(st.prices.price));
  }).on("mouseout", function(st) {
    d3.select(this).transition().duration(100).attr("r", 4);
    is_label_hovered = false;
    _.delay(hideLabel, 500);
    return true;
  }).transition().duration(transition).attr("cx", function(st) {
    return x(st.index);
  }).attr("cy", function(st) {
    return y(st.prices.price);
  });
  circles.enter().append("a").attr("class", "stop").attr("target", "_blank").attr("xlink:href", function(st) {
    return st.prices.url;
  }).append("circle").attr("r", 0).attr("cx", function(st) {
    return x(st.index);
  }).attr("cy", function(st) {
    return y(st.prices.price);
  }).on("mouseover", function(st) {
    d3.select(this).transition().duration(500).attr("r", 8);
    return showLabel(st, x(st.index), y(st.prices.price));
  }).on("mouseout", function(st) {
    d3.select(this).transition().duration(100).attr("r", 4);
    is_label_hovered = false;
    _.delay(hideLabel, 500);
    return true;
  }).transition().duration(transition).attr("r", 4);
  circles.exit().remove();
  renderCategories(line_index, category);
  return true;
};

showLabel = function(circle, x, y) {
  var h, w;
  is_label_hovered = true;
  label.style("display", "block");
  label.select(".header").text(circle.d.name);
  label.select(".price").text(categoryText(circle.prices.price, circle.prices.category)).attr("y", text_padding + label.select(".header").node().getBBox().height);
  label.select(".link").attr("xlink:href", circle.prices.url).select("text").attr("y", text_padding * 2 + label.select(".header").node().getBBox().height + label.select(".price").node().getBBox().height);
  w = text_padding * 2 + _.max([label.select(".header").node().getBBox().width, label.select(".price").node().getBBox().width, label.select(".link").select("text").node().getBBox().width]);
  h = label.select(".header").node().getBBox().height + label.select(".price").node().getBBox().height + label.select(".link").select("text").node().getBBox().height + text_padding * 2;
  label.select("rect").attr("width", w).attr("height", h);
  if (20 + w + x > width) {
    x = x - w - 20;
  } else {
    x = x + 20;
  }
  y = y - h / 2;
  return label.attr("transform", "translate(" + x + "," + y + ")").style("display", "block").style("opacity", 0).transition().duration(transition).style("opacity", 100);
};

hideLabel = function() {
  if (!is_label_hovered) {
    return label.transition().duration(transition / 2).style("opacity", 0).transition().duration(0).style("display", "none");
  }
};
