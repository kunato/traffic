from django.db import models

# Create your models here.

class Camera(models.Model):
	name = models.CharField(max_length=200)
	url = models.CharField(max_length=200)
	height = models.IntegerField()
	width = models.IntegerField()

class Video(models.Model):
	name = models.CharField(max_length=200)
	url = models.CharField(max_length=200)
	camera = models.ForeignKey(Camera)
	start_time = models.DateTimeField()
	status = models.FloatField()



class Map(models.Model):
	center_lat = models.FloatField()
	center_lng = models.FloatField()
	zoom = models.IntegerField()


class MapPoint(models.Model):
	name = models.CharField(max_length=200,null=True)
	latitude = models.FloatField()
	longitude = models.FloatField()
	map = models.ForeignKey(Map)


class CameraPoint(models.Model):
	name = models.CharField(max_length=200,null=True)
	mapPoint = models.ForeignKey(MapPoint)
	top = models.FloatField()
	left = models.FloatField()
	height = models.FloatField()
	width = models.FloatField()

class DataRelation(models.Model):
	name = models.CharField(max_length=200)
	#blue 2 red 1
	cameraPoint1 = models.ForeignKey(CameraPoint,related_name='camera_start')
	cameraPoint2 = models.ForeignKey(CameraPoint,related_name='camera_end')
	camera = models.ForeignKey(Camera)
	camera_length = models.IntegerField()
	map_length = models.IntegerField()

class VideoData(models.Model):
	data_relation = models.ForeignKey(DataRelation)
	go_to = models.IntegerField()
	speed = models.FloatField()
	appear_time = models.DateTimeField()

	def __unicode__(self):
		return "Invert "+str(self.go_to)+" speed :"+str(self.speed)+" appear_time :"+str(self.appear_time)

class Traffic(models.Model):
	name = models.CharField(max_length=200)
	speed = models.FloatField()
	data_relation = models.ForeignKey(DataRelation)