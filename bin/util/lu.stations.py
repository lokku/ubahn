# cat ~/workspace/maps/data/transport/data/stops.csv | grep ",MET," | grep "Underground St" |  sed -e 's/ Underground Station//g' | sed -e 's/9400ZZLU//g' | awk -F',' 'BEGIN{OFS="\t"}{print $1, $3, $8,$9}'
# cat u.txt |  grep -v "|-" | awk -F'|' '{print $3}' | awk -F']' '{print $1}' | tr ' ' '-' | sed 's/[^a-zA-Z0-9-]//g' | tr '[A-Z]' '[a-z]' | awk '{print "\""$1"\""}' | tr '\n' ','
import json
import re
import sys

pattern = re.compile('([^\s\w]|_)+')

def create_code(name):
	return pattern.sub('',name.strip().lower().replace("&","and")).replace(" ","-")

field_names=['code','name','lng','lat']
out={}
for line in sys.stdin:
	a=dict(zip(field_names,line.strip().split("\t")))
	a['nestoria_code']=create_code(a['name'])
	out[a['nestoria_code']]=a
print json.dumps(out)
	
	
