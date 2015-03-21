import os
def saveFile(id,type,ufile):
	path = os.path.dirname(os.path.realpath(__file__))+"/../static/video/"+str(id)+"."+type
	path = os.path.abspath(path)
	# path = "/Users/kunato/final_project/server/static/video/"+str(id)+'.'+type
	dest = open(path, "w")
	for chunk in ufile.chunks():
   		dest.write(chunk)
	dest.close()
	return path