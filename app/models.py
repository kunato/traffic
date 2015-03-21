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
	name = models.CharField(max_length=200)
	url = models.CharField(max_length=200)
	height = models.IntegerField()
	width = models.IntegerField()

class MapPoint(models.Model):
	name = models.CharField(max_length=200)
	color = models.CharField(max_length=8)
	top = models.FloatField()
	left = models.FloatField()
	map = models.ForeignKey(Map)

class CameraPoint(models.Model):
	name = models.CharField(max_length=200)
	mapPoint = models.ForeignKey(MapPoint)
	camera = models.ForeignKey(Camera)
	top = models.FloatField()
	left = models.FloatField()
	height = models.FloatField()
	width = models.FloatField()
	length = models.FloatField()

class DataRelation(models.Model):
	name = models.CharField(max_length=200)
	cameraPoint1 = models.ForeignKey(CameraPoint,related_name='camera_start')
	cameraPoint2 = models.ForeignKey(CameraPoint,related_name='camera_end')
	camera_length = models.IntegerField()
	map_length = models.IntegerField()

class Car(models.Model):
	name = models.CharField(max_length=200)
	appear_position_x = models.IntegerField()
	appear_position_y = models.IntegerField()
	last_position_x = models.IntegerField()
	last_position_y = models.IntegerField()
	diff_time = models.IntegerField()
	appear_time = models.DateTimeField()
	data_relation = models.ForeignKey(DataRelation)