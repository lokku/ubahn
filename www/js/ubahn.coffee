width = 750
height = 300
padding = 30
left_padding = 80
text_padding = 10
data = {}
transition = 800
active_cat = "1"
is_label_hovered = false
svg = d3.select("#graph").append("svg").attr("height",height).attr("width",width)
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

categoryText = (price, cat) -> intf(price) + " for "+cat+" bedroom flat"

renderCategories = (line_index)->
	cats = d3.select("#categories").selectAll(".category").data(["1","2","3","4","5"])
	.on("click",(d) -> draw_line(line_index,d))
	.text((d)-> a = d+" bed"; a = a + "s" if d!="1"; return a)
	.attr("class",(d)-> if d == active_cat then "active category" else "category")

	cats.enter().append("a").attr("href","#")
	.attr("class",(d)-> if d == active_cat then "active category" else "category")
	.on("click",(d) -> draw_line(line_index,d))
	.text((d)-> a= d+" bed"; a = a + "s" if d!="1"; return a)
	return true

#pathgroup=svg.append("g").attr("class","path")
#svg.append("g").attr("class","points")
#svg.append("g").attr("class","labels")
max_price = 0
d3.json( "data/london.json", (json_data) ->
	data = json_data
	d3.select("#lines").selectAll(".line").data(data.lines).enter()
		.append("a")
		.attr("class","line")
		.text((d) -> d.name)
		.style("background-color",(d) -> d['background-color'])
		.style("color",(d) -> d.color)
		.attr("href","#")
		.on("click",(d,i) -> console.log("click"); draw_line(i,active_cat))
	d3.select("#lines").selectAll(".line").data(data.lines)
		.attr("class","line").text((d) -> d.name).style("background-color",(d) -> d['background-color'])
	d3.select("#lines").selectAll(".line").data(data.lines).exit().remove()
	

)
#getMaxPrice = _.memoize( (category) -> _.max [ d.price for d in station.prices where d.category==category for station in data.stations])
getMaxPrice = (category) -> 
	dd = []
	m = 0
	for station in _.values(data.stations)
		for d in station.prices
			if d.category==category and d.price>m
				m = d.price 
	
	#console.log("Max is "+m)
	return m
	
draw_line = (line_index,category) ->
	#debugger;
	active_cat = category
	is_label_hovered = false
	hideLabel()
	line = data.lines[line_index]
	max_price = getMaxPrice(category)
	stations = [{'index':i,'d': data.stations[st], 'prices': _.find(data.stations[st].prices,(d) -> d.category==category)} for st,i in data.lines[line_index].stations]
	#console.log(stations)
	
	#x = d3.scale.linear().domain([0,line.stations.length]).rangeRound([padding,width-padding])
	x = d3.scale.linear().domain([0,45]).rangeRound([left_padding,width-padding])
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
	path.transition().duration(transition).attr("d",(d) -> lineGenerator(d))
		
	path.enter()
		.append("path").attr("d",(d) -> initialLineGenerator(d)).style("stroke",data.lines[line_index]['background-color']).attr("class","path")
		.transition().duration(transition).attr("d",(d) -> lineGenerator(d))
		
	path.exit().remove()

	circles = graph.selectAll(".stop").data(stations[0])
	circles.attr("xlink:href",(st)->st.prices.url).select("circle")
		.on("mouseover",(st) -> d3.select(this).transition().duration(500).attr("r",8); showLabel(st,x(st.index),y(st.prices.price)))
		.on("mouseout",(st) -> d3.select(this).transition().duration(100).attr("r",4); is_label_hovered=false; _.delay(hideLabel,500); return true;)
		
		.transition().duration(transition)
		.attr("cx",(st)-> x(st.index)).attr("cy",(st) -> y(st.prices.price))
	circles.enter().append("a").attr("class","stop").attr("target","_blank").attr("xlink:href",(st)->st.prices.url)
		.append("circle").attr("r",0)
		.attr("cx",(st)-> x(st.index)).attr("cy",(st) -> y(st.prices.price))
		.on("mouseover",(st) -> d3.select(this).transition().duration(500).attr("r",8); showLabel(st,x(st.index),y(st.prices.price)))
		.on("mouseout",(st) -> d3.select(this).transition().duration(100).attr("r",4);is_label_hovered=false; _.delay(hideLabel,500); return true;)
		.transition().duration(transition).attr("r",4)

	circles.exit().remove()
	renderCategories(line_index,category)
	return true


showLabel = (circle,x,y) ->
	#console.log()
	is_label_hovered = true
	label.select(".header").text(circle.d.name)
	label.select(".price").text(categoryText(circle.prices.price,circle.prices.category)).attr("y",text_padding+label.select(".header").node().getBBox().height)
	label.select(".link").attr("xlink:href",circle.prices.url)
	.select("text").attr("y",text_padding*2+label.select(".header").node().getBBox().height+label.select(".price").node().getBBox().height)
	w = text_padding * 2 + _.max([
		label.select(".header").node().getBBox().width,
		label.select(".price").node().getBBox().width,
		label.select(".link").select("text").node().getBBox().width
		]

	)
	h = label.select(".header").node().getBBox().height+label.select(".price").node().getBBox().height+label.select(".link").select("text").node().getBBox().height+text_padding * 2

	label.select("rect").attr("width",w).attr("height",h)
	if 20 + w + x >width
		x = x - w - 20
	else
		x = x + 20
	y = y - h / 2
	label.attr("transform", "translate("+x+","+y+")")
	.style("display","block")
	.style("opacity",0)
	.transition().duration(transition).style("opacity",100)


hideLabel = ()	 ->
	#console.log("Checking if have to hide hover. is_label_hovered is "+ is_label_hovered)
	if not is_label_hovered
		#console.log("Hiding hover")
		label.transition().duration(transition/2).style("opacity",0).transition().duration(0).style("display","none")


