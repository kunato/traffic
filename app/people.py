import cv2
import numpy as np
class People:
	newid = 0
	def __init__(self,position,time):
		self.id = People.newid
		self.count = 0
		People.newid += 1
		self.appear_position = np.array(position)
		self.position = np.array(position)
		self.appear_time = time
		self.time = time
		
	def move(self,position,time):
		self.position = np.array(position)
		self.time = time
		self.count += 1

	#implement ???
	def getArea(self):
		area = 0
		for i in contour:
			area += cv2.contourArea(i)
		return area

	def save(self):
		self.last_position = self.position
		self.last_time = self.time


	def addContour(self,contour):
		self.contours.append(contour)

	def getId(self):
		return self.id

	def __str__(self):
		return str("{\nid "+str(self.id)+
			"\nappear_position "+str(self.appear_position)+
			"\nlast_position "+str(self.last_position)+
			"\ndiff_time "+str(self.last_time - self.appear_time)+
			"\ncount "+str(self.count)+"\n}")

	def __repr__(self):
		return self.__str__()