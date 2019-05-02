print('loading libs:')
import glob
import os
print('loading numpy')
import numpy as np
print('loading skimage')
from skimage import data
from random import randint
print('libs loaded')
out='{'
folders =['ukrainian', 'asian', 'european', 'american']
for index, folder in enumerate(folders):
	files = glob.glob('imgs\\'+folder+'/*.jpg')
	out+='"'+folders[index]+'":['

	for count, file in enumerate(files):
		img = data.load('E:\\Учеба\\Epam\\project\\Site\\'+file)
		print(file)
		temp=''
		temp+='{'
		temp+='"price": '+str(randint(70,280))+','
		temp+='"name": "'+folders[index]+str(count+1)+'",'
		temp+='"img": "'+file.replace('\\', '\\\\')+'",'
		temp+='"desc": "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Numquam culpa sequi, dignissimos ipsum molestiae veritatis.",'
		temp+='"totalBuys": '+str(randint(15,2000))+','
		temp+='"vertical": '
		if(len(img)>=len(img[0])):
			temp+='true'
		else:
			temp+='false'
		temp+=',"info": [{"name": "Beef", "amount": 100},{"name": "Vegetables", "amount": 100},{"name": "Oil", "amount": 100}]'
		temp+='}'
		if(count+1<len(files)):
			temp+=','
		out+=temp
	out+=']'
	if(index+1<len(folders)):
		out+=','
out+='}'
out.replace('\\\\','\\\\\\\\')
open('data.json', 'w', encoding='utf-8').write(out)
print('finish')