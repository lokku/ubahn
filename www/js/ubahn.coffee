padding = 30
left_padding = 80
text_padding = 10
data = {}
active_line = 0
max_price = 0


is_label_hovered = false
is_ff = (navigator.userAgent.indexOf("Chrome")==-1)

svg = d3.select("#graph").append("svg").attr("height",window.height).attr("width",window.width)
graph = svg.append("g").attr("class","graph");
label = svg.append("g").attr("class","label")
	.on("mouseover",() ->  is_label_hovered = true)
	.on("mouseout",() ->  is_label_hovered = false; _.delay(hideLabel,300))
label.append("rect").attr("class","background").attr("x",0).attr("y",0)
label.append("text").attr("class","header").attr("y",text_padding).attr("x",text_padding)
label.append("text").attr("class","price").attr("x",text_padding)
label.append("a").attr("class","link").attr("target","_blank").attr("href","test").append("text").attr("x",text_padding).text("See the list of properties")
xAxis = yAxis = d3.scale.linear()
intf = (v) -> data.currency+d3.format(",.0f")(v/1000)+"k"

categoryText = (price, cat) -> 
	if cat!="all"
		intf(price) + " for "+cat+" bedroom flat"
	else
		"average price "+intf(price)

renderList = (cityList) ->
	list = d3.select("#citylist").selectAll("li a").data(cityList)
	
	list.enter()
	.append("li")
	#.attr("class",(d) -> if activeCity==d.key then "active" else "")
	.attr("id",(d) -> "city_"+d.key )
	.append("a").attr("href",(d)->"#"+d.key)
	.text((d)-> d.name)
	.on("click", (d) -> d3.event.stopPropagation(); active_city=d.key; load_city(d.key); )

	
	return true

load_city = (city) ->
	window.active_city = city
	console.log("loading "+window.active_city)
	#renderList(cityList, activeCity)

	d3.select("#citylist").selectAll("li.active").attr("class","")
	d3.select("#city_"+city).attr("class","active")

	d3.json( "cities/"+city+".json", (json_data) ->
		data = json_data
		d3.tsv("cities/"+city+".tsv", (tsv_data) ->
			stations = d3.nest().key((d)-> d.station).entries(tsv_data)
			#console.debug(stations)
			#debugger;
			for station in stations
				for val in station.values
					val.price = +val.price
					val.num = +val.num
				data.stations[station.key].prices = station.values
			d3.select("#lines").selectAll(".line").data(data.lines).enter()
				.append("a")
				.attr("id",(d,i)->"line_"+i)
				.attr("class","line")
				.text((d) -> d.name)
				.style("background-color",(d) -> d['background-color'])
				.style("color",(d) -> d.color)
				.attr("href",(d,i) -> "#"+city+"|"+i+"|"+active_cat)
				.on("click",(d,i) -> d3.event.stopPropagation();draw_line(i,active_cat))
			d3.select("#lines").selectAll(".line").data(data.lines)
				.attr("id",(d,i)->"line_"+i)
				.attr("href",(d,i) -> "#"+city+"|"+i+"|"+active_cat)
				.attr("class","line").text((d) -> d.name).style("background-color",(d) -> d['background-color'])
			d3.select("#lines").selectAll(".line").data(data.lines).exit().remove()
			#d3.select("#categories .category").remove()
			active_line = 0
			draw_line(active_line,window.active_cat)
			
		)
	)


renderCategories = (line_index,active_cat) ->
	#window.location.hash=active_city+"|"+line_index+"|"+category
	#debugger;
	console.log("Active city is "+active_city)
	cats = d3.select("#categories").selectAll(".category").data(["all","1","2","3","4"])
	.on("click",(d) -> draw_line(line_index,d))
	.text((d)-> a = d+" bed"; a = a + "s" if d!="1"; a = "all" if d=="all"; return a)
	.attr("class",(d)-> if d == active_cat then "btn active category" else "btn category")
	.attr("href",(d) -> "#"+window.active_city+"|"+line_index+"|"+d)	
	.attr("id",(d)->"cat_"+d)

	cats.enter().append("a").attr("href",(d) -> "#"+window.active_city+"|"+line_index+"|"+d)
	.attr("id",(d)->"cat_"+d)
	.attr("class",(d)-> if d == active_cat then "btn active category" else "btn category")
	.on("click",(d) -> d3.event.preventDefault(); d3.event.stopPropagation(); draw_line(line_index,d))
	.text((d)-> a= d+" bed"; a = a + "s" if d!="1";  a = "all" if d=="all"; return a)

	cats.exit().remove()
	#debugger;
	#d3.selectAll("#categories .active").attr("class","btn category")
	#d3.select("#categories #cat_"+active_cat).attr("class","btn active category")
	

	return true

#pathgroup=svg.append("g").attr("class","path")
#svg.append("g").attr("class","points")
#svg.append("g").attr("class","labels")

getMaxPrice = (category) -> 
	dd = []
	m = 0
	for station in _.values(data.stations)
		if station.prices
			for d in station.prices
				if d.category==category and d.price>m
					m = d.price 
	
	console.log("Max is "+m)
	return m
	
draw_line = (line_index,category) ->
	#debugger;
	
	d3.selectAll("#lines .active").attr("class","line")
	d3.select("#lines #line_"+line_index).attr("class","line active")
	
	
	window.active_cat = category
	is_label_hovered = false
	hideLabel()
	line = data.lines[line_index]
	max_price = getMaxPrice(category)
	stations = [{'index':i,'d': data.stations[st], 'prices': _.find(data.stations[st].prices,(d) -> d.category==category)} for st,i in data.lines[line_index].stations when data.stations[st].prices]
	#console.log(stations)
	
	x = d3.scale.linear().domain([0,line.stations.length]).rangeRound([left_padding,width-padding])
	#x = d3.scale.linear().domain([0,45]).rangeRound([left_padding,width-padding])
	y = d3.scale.linear().domain([0,max_price]).rangeRound([height-padding,padding])
	#debugger;
	yAxis = d3.svg.axis().scale(y).ticks(5).tickSubdivide(false).orient("left").tickFormat(intf)
	axis = graph.selectAll(".axis").data([1])
	axis.enter().append("svg:g")
			      .attr("class", "axis")
			      .attr("transform", "translate("+(left_padding-10)+",0)")
			      .call(yAxis);
	axis.call(yAxis);

	initialLineGenerator = d3.svg.line().x((st) -> x(st.index)).y((st) -> y(0))
	lineGenerator = d3.svg.line().x((st) -> x(st.index)).y((st) -> y(st.prices.price))
	path = graph.selectAll(".path").data(stations)
		.style("stroke",data.lines[line_index]['background-color'])
	path.transition().duration(window.transition).attr("d",(d) -> lineGenerator(d))
		
	path.enter()
		.append("path").attr("d",(d) -> initialLineGenerator(d)).style("stroke",data.lines[line_index]['background-color']).attr("class","path")
		.transition().duration(window.transition).attr("d",(d) -> lineGenerator(d))
		
	path.exit().remove()

	ct = categoryText
	city_props = _.find(window.cities,(d) -> d.key ==window.active_city)
	if city_props and city_props.categoryText
		ct = city_props.categoryText

	circles = graph.selectAll(".stop").data(stations[0])
	circles.attr("xlink:href",(st)->st.prices.url).select("circle")
		.on("mouseover",(st) -> d3.select(this).transition().duration(500).attr("r",8); showLabel(st,x(st.index),y(st.prices.price), ct))
		.on("mouseout",(st) -> d3.select(this).transition().duration(100).attr("r",4); is_label_hovered=false; _.delay(hideLabel,500); return true;)
		
		.transition().duration(transition)
		.attr("cx",(st)-> x(st.index)).attr("cy",(st) -> y(st.prices.price))
	circles.enter().append("a").attr("class","stop").attr("target","_blank").attr("xlink:href",(st)->st.prices.url)
		.append("circle").attr("r",0)
		.attr("cx",(st)-> x(st.index)).attr("cy",(st) -> y(st.prices.price))
		.on("mouseover",(st) -> d3.select(this).transition().duration(500).attr("r",8); showLabel(st,x(st.index),y(st.prices.price),ct))
		.on("mouseout",(st) -> d3.select(this).transition().duration(100).attr("r",4);is_label_hovered=false; _.delay(hideLabel,500); return true;)
		.transition().duration(transition).attr("r",4)

	circles.exit().remove()
	renderCategories(line_index,category)
	#window.location.hash=active_city+"|"+line_index+"|"+category
	return true


showLabel = (circle,x,y, ct = categoryText) ->
	#console.log()
	is_label_hovered = true
	label.style("display","block");
	header_padding = text_padding
	if is_ff then header_padding = text_padding*2
	label.select(".header").text(circle.d.name).attr("y",header_padding)
	label.select(".price").text(ct(circle.prices.price,circle.prices.category)).attr("y",2*text_padding+label.select(".header").node().getBBox().height)
	label.select(".link").attr("xlink:href",circle.prices.url)
	.select("text").attr("y",text_padding*3+label.select(".header").node().getBBox().height+label.select(".price").node().getBBox().height)
	w = text_padding * 2 + _.max([
		label.select(".header").node().getBBox().width,
		label.select(".price").node().getBBox().width,
		label.select(".link").select("text").node().getBBox().width
		]

	)
	h = label.select(".header").node().getBBox().height+label.select(".price").node().getBBox().height+label.select(".link").select("text").node().getBBox().height+text_padding * 2 + header_padding

	label.select("rect").attr("width",w).attr("height",h)
	if 20 + w + x >width
		x = x - w - 20
	else
		x = x + 20
	y = y - h / 2
	#console.log(y)
	if y<20 then y=20
	label.attr("transform", "translate("+x+","+y+")")
	.style("display","block")
	.style("opacity",0)
	.transition().duration(window.transition).style("opacity",100)


hideLabel = ()	 ->
	#console.log("Checking if have to hide hover. is_label_hovered is "+ is_label_hovered)
	if not is_label_hovered
		#console.log("Hiding hover")
		label.transition().duration(window.transition/2).style("opacity",0).transition().duration(0).style("display","none")


renderList(window.cities, window.active_city)
load_city(window.active_city)