var sqm_category_text = function(price,cat){
	if (cat !== "all") {
  intf(price) + " per sq m for " + cat + " bedroom flat";
} else {
  "average price " + intf(price);
}
}

window.cities = [
	{ 'key': 'barcelona', 'name': 'Barcelona' },
	{ 'key': 'berlin', 'name': 'Berlin', 'categoryText' : sqm_category_text },
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
