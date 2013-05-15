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
	{ 'key': 'chennai', 'name': 'Chennai' },
	{ 'key': 'hamburg', 'name': 'Hamburg' },
	{ 'key': 'kolkatta', 'name': 'Kolkatta' },
	{ 'key' :'london', 'name': 'London' },
	{ 'key': 'madrid', 'name': 'Madrid' },
	{ 'key': 'melbourne', 'name': 'Melbourne' },
	{ 'key': 'mumbai', 'name': 'Mumbai' },
	{ 'key': 'munich', 'name': 'Munich' },
	{ 'key': 'new_dehli', 'name': 'New Dehli' },
	{ 'key': 'paris', 'name': 'Paris' },
	{ 'key': 'rio', 'name': 'Rio de Janeiro' },
	{ 'key': 'rome', 'name': 'Rome' },
	{ 'key': 'sao_paulo', 'name': 'Sao Paulo' },
	{ 'key': 'sydney', 'name': 'Sydney' },
]

window.active_city = 'london'

window.transition = 800
window.active_cat = "all"

// graph properties
window.width = 600
window.height = 300
