var eu_sqm_category_text = function(price,cat){
	if (cat !== "all") {
  	return "EU"+d3.format(",.0f")(price/1000)+"k per sq m for " + cat + " bedroom flat";
} else {
  return "average price EU" + d3.format(",.0f")(price/1000)+"k";
}
}

window.cities = [
	{ 'key': 'barcelona', 'name': 'Barcelona' },
	{ 'key': 'berlin', 'name': 'Berlin', 'categoryText' : eu_sqm_category_text },
	{ 'key': 'chennai', 'name': 'Chennai (To do)' },
	{ 'key': 'hamburg', 'name': 'Hamburg' },
	{ 'key': 'kolkata', 'name': 'Kolkata (To do)' },
	{ 'key' :'london', 'name': 'London' },
	{ 'key': 'madrid', 'name': 'Madrid (in progress)' },
	{ 'key': 'melbourne', 'name': 'Melbourne' },
	{ 'key': 'mumbai', 'name': 'Mumbai (To do)' },
	{ 'key': 'munich', 'name': 'Munich' },
	{ 'key': 'new_delhi', 'name': 'New Dehli (To do)' },
	{ 'key': 'paris', 'name': 'Paris' },
	{ 'key': 'rio_de_janeiro', 'name': 'Rio de Janeiro (in progress)' },
	{ 'key': 'rome', 'name': 'Rome' },
	{ 'key': 'sao_paulo', 'name': 'Sao Paulo' }
]

//Sydney removed as the metro programme was abandoned.
//São Paulo lines 4 to 6


window.active_city = 'london'

window.transition = 800
window.active_cat = "all"

// graph properties
window.width = 600
window.height = 300
