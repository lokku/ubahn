width = 650
height = 300
padding = 20
data = {}
transition = 1500
svg = d3.select("#graph").append("svg").attr("height",height).attr("width",width)
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
		.on("click",(d,i) -> console.log("click"); draw_line(i,"1"))
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
	line = data.lines[line_index]
	max_price = getMaxPrice(category)
	stations = [{'index':i,'d': data.stations[st], 'prices': _.find(data.stations[st].prices,(d) -> d.category==category)} for st,i in data.lines[line_index].stations]
	console.log(stations)
	
	#x = d3.scale.linear().domain([0,line.stations.length]).rangeRound([padding,width-padding])
	x = d3.scale.linear().domain([0,45]).rangeRound([padding,width-padding])
	y = d3.scale.linear().domain([0,max_price]).rangeRound([height-padding,padding])
	#debugger;
	yAxis = d3.svg.axis().scale(y).tickSize(max_price/5).tickSubdivide(false)
	initialLineGenerator = d3.svg.line().x((st) -> x(st.index)).y((st) -> y(0))
	lineGenerator = d3.svg.line().x((st) -> x(st.index)).y((st) -> y(st.prices.price))
	path = svg.selectAll(".path").data(stations)
		.style("stroke",data.lines[line_index]['background-color'])
	path.transition().duration(transition).attr("d",(d) -> lineGenerator(d))
		
	path.enter()
		.append("path").attr("d",(d) -> initialLineGenerator(d)).style("stroke",data.lines[line_index]['background-color']).attr("class","path")
		.transition().duration(transition).attr("d",(d) -> lineGenerator(d))
		
	path.exit().remove()

	circles = svg.selectAll(".stop").data(stations[0])
	circles
		.transition().duration(transition)
		.attr("cx",(st)-> x(st.index)).attr("cy",(st) -> y(st.prices.price))
	circles.enter().append("circle")
		.attr("class","stop").attr("r",0)
		.attr("cx",(st)-> x(st.index)).attr("cy",(st) -> y(st.prices.price))
		.transition().duration(transition).attr("r",4)
	circles.exit().remove()

