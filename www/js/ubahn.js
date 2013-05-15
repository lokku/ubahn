var active_line, categoryText, data, draw_line, getMaxPrice, graph, hideLabel, intf, is_ff, is_label_hovered, label, left_padding, load_city, max_price, padding, renderCategories, renderList, showLabel, svg, text_padding, xAxis, yAxis;

padding = 30;

left_padding = 80;

text_padding = 10;

data = {};

active_line = 0;

max_price = 0;

is_label_hovered = false;

is_ff = navigator.userAgent.indexOf("Chrome") === -1;

svg = d3.select("#graph").append("svg").attr("height", window.height).attr("width", window.width);

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
  if (cat !== "all") {
    return intf(price) + " for " + cat + " bedroom flat";
  } else {
    return "average price " + intf(price);
  }
};

renderList = function(cityList) {
  var list;
  list = d3.select("#citylist").selectAll("li a").data(cityList);
  list.enter().append("li").attr("id", function(d) {
    return "city_" + d.key;
  }).append("a").attr("href", function(d) {
    return "#" + d.key;
  }).text(function(d) {
    return d.name;
  }).on("click", function(d) {
    var active_city;
    d3.event.stopPropagation();
    active_city = d.key;
    return load_city(d.key);
  });
  return true;
};

load_city = function(city) {
  window.active_city = city;
  console.log("loading " + window.active_city);
  d3.select("#citylist").selectAll("li.active").attr("class", "");
  d3.select("#city_" + city).attr("class", "active");
  return d3.json("cities/" + city + ".json", function(json_data) {
    data = json_data;
    return d3.tsv("cities/" + city + ".tsv", function(tsv_data) {
      var station, stations, val, _i, _j, _len, _len2, _ref;
      stations = d3.nest().key(function(d) {
        return d.station;
      }).entries(tsv_data);
      for (_i = 0, _len = stations.length; _i < _len; _i++) {
        station = stations[_i];
        _ref = station.values;
        for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
          val = _ref[_j];
          val.price = +val.price;
          val.num = +val.num;
        }
        data.stations[station.key].prices = station.values;
      }
      d3.select("#lines").selectAll(".line").data(data.lines).enter().append("a").attr("id", function(d, i) {
        return "line_" + i;
      }).attr("class", "line").text(function(d) {
        return d.name;
      }).style("background-color", function(d) {
        return d['background-color'];
      }).style("color", function(d) {
        return d.color;
      }).attr("href", function(d, i) {
        return "#" + city + "|" + i + "|" + active_cat;
      }).on("click", function(d, i) {
        d3.event.stopPropagation();
        return draw_line(i, active_cat);
      });
      d3.select("#lines").selectAll(".line").data(data.lines).attr("id", function(d, i) {
        return "line_" + i;
      }).attr("href", function(d, i) {
        return "#" + city + "|" + i + "|" + active_cat;
      }).attr("class", "line").text(function(d) {
        return d.name;
      }).style("background-color", function(d) {
        return d['background-color'];
      }).on("click", function(d, i) {
        d3.event.stopPropagation();
        return draw_line(i, active_cat);
      });
      d3.select("#lines").selectAll(".line").data(data.lines).exit().remove();
      active_line = 0;
      return draw_line(active_line, window.active_cat);
    });
  });
};

renderCategories = function(line_index, active_cat) {
  var cats;
  console.log("Active city is " + active_city);
  cats = d3.select("#categories").selectAll(".category").data(["all", "1", "2", "3", "4"]).on("click", function(d) {
    d3.event.preventDefault();
    d3.event.stopPropagation();
    return draw_line(line_index, d);
  }).text(function(d) {
    var a;
    a = d + " bed";
    if (d !== "1") a = a + "s";
    if (d === "all") a = "all";
    return a;
  }).attr("class", function(d) {
    if (d === active_cat) {
      return "btn active category";
    } else {
      return "btn category";
    }
  }).attr("href", function(d) {
    return "#" + window.active_city + "|" + line_index + "|" + d;
  }).attr("id", function(d) {
    return "cat_" + d;
  });
  cats.enter().append("a").attr("href", function(d) {
    return "#" + window.active_city + "|" + line_index + "|" + d;
  }).attr("id", function(d) {
    return "cat_" + d;
  }).attr("class", function(d) {
    if (d === active_cat) {
      return "btn active category";
    } else {
      return "btn category";
    }
  }).on("click", function(d) {
    d3.event.preventDefault();
    d3.event.stopPropagation();
    return draw_line(line_index, d);
  }).text(function(d) {
    var a;
    a = d + " bed";
    if (d !== "1") a = a + "s";
    if (d === "all") a = "all";
    return a;
  });
  cats.exit().remove();
  return true;
};

getMaxPrice = function(category) {
  var d, dd, m, station, _i, _j, _len, _len2, _ref, _ref2;
  dd = [];
  m = 0;
  _ref = _.values(data.stations);
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    station = _ref[_i];
    if (station.prices) {
      _ref2 = station.prices;
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        d = _ref2[_j];
        if (d.category === category && d.price > m) m = d.price;
      }
    }
  }
  console.log("Max is " + m);
  return m;
};

draw_line = function(line_index, category) {
  var axis, circles, city_props, ct, i, initialLineGenerator, line, lineGenerator, path, st, stations, x, y;
  d3.selectAll("#lines .active").attr("class", "line");
  d3.select("#lines #line_" + line_index).attr("class", "line active");
  window.active_cat = category;
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
        if (data.stations[st].prices) {
          _results.push({
            'index': i,
            'd': data.stations[st],
            'prices': _.find(data.stations[st].prices, function(d) {
              return d.category === category;
            })
          });
        }
      }
      return _results;
    })()
  ];
  x = d3.scale.linear().domain([0, line.stations.length]).rangeRound([left_padding, width - padding]);
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
  path.transition().duration(window.transition).attr("d", function(d) {
    return lineGenerator(d);
  });
  path.enter().append("path").attr("d", function(d) {
    return initialLineGenerator(d);
  }).style("stroke", data.lines[line_index]['background-color']).attr("class", "path").transition().duration(window.transition).attr("d", function(d) {
    return lineGenerator(d);
  });
  path.exit().remove();
  ct = categoryText;
  city_props = _.find(window.cities, function(d) {
    return d.key === window.active_city;
  });
  if (city_props && city_props.categoryText) ct = city_props.categoryText;
  circles = graph.selectAll(".stop").data(stations[0]);
  circles.attr("xlink:href", function(st) {
    return st.prices.url;
  }).select("circle").on("mouseover", function(st) {
    d3.select(this).transition().duration(500).attr("r", 8);
    return showLabel(st, x(st.index), y(st.prices.price), ct);
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
    return showLabel(st, x(st.index), y(st.prices.price), ct);
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

showLabel = function(circle, x, y, ct) {
  var h, header_padding, w;
  is_label_hovered = true;
  label.style("display", "block");
  header_padding = text_padding;
  console.log(ct(circle.prices.price, circle.prices.category));
  if (is_ff) header_padding = text_padding * 2;
  label.select(".header").text(circle.d.name).attr("y", header_padding);
  label.select(".price").text(ct(circle.prices.price, circle.prices.category)).attr("y", 2 * text_padding + label.select(".header").node().getBBox().height);
  label.select(".link").attr("xlink:href", circle.prices.url).select("text").attr("y", text_padding * 3 + label.select(".header").node().getBBox().height + label.select(".price").node().getBBox().height);
  w = text_padding * 2 + _.max([label.select(".header").node().getBBox().width, label.select(".price").node().getBBox().width, label.select(".link").select("text").node().getBBox().width]);
  h = label.select(".header").node().getBBox().height + label.select(".price").node().getBBox().height + label.select(".link").select("text").node().getBBox().height + text_padding * 2 + header_padding;
  label.select("rect").attr("width", w).attr("height", h);
  if (20 + w + x > width) {
    x = x - w - 20;
  } else {
    x = x + 20;
  }
  y = y - h / 2;
  if (y < 20) y = 20;
  return label.attr("transform", "translate(" + x + "," + y + ")").style("display", "block").style("opacity", 0).transition().duration(window.transition).style("opacity", 100);
};

hideLabel = function() {
  if (!is_label_hovered) {
    return label.transition().duration(window.transition / 2).style("opacity", 0).transition().duration(0).style("display", "none");
  }
};

renderList(window.cities, window.active_city);

load_city(window.active_city);
