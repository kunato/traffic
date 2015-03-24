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

class VideoData(models.Model):
	video = models.ForeignKey(Video)
	appear_position_x = models.FloatField()
	appear_position_y = models.FloatField()
	last_position_x = models.FloatField()
	last_position_y = models.FloatField()
	diff_time = models.FloatField()
	appear_time = models.DateTimeField()
	process = models.IntegerField()

class Map(models.Model):
	name = models.CharField(max_length=200)
	url = models.CharField(max_length=200)
	height = models.IntegerField()
	width = models.IntegerField()


class CameraPoint(models.Model):
	name = models.CharField(max_length=200)
	
	camera = models.ForeignKey(Camera)
	top = models.FloatField()
	left = models.FloatField()
	height = models.FloatField()
	width = models.FloatField()


class MapPoint(models.Model):
	name = models.CharField(max_length=200)
	color = models.CharField(max_length=8)
	cameraPoint = models.ForeignKey(CameraPoint)
	top = models.FloatField()
	left = models.FloatField()
	map = models.ForeignKey(Map)
	
class DataRelation(models.Model):
	name = models.CharField(max_length=200)
	cameraPoint1 = models.ForeignKey(CameraPoint,related_name='camera_start')
	cameraPoint2 = models.ForeignKey(CameraPoint,related_name='camera_end')
	camera_length = models.IntegerField()
	map_length = models.IntegerField()

class Car(models.Model):
	name = models.CharField(max_length=200)
	speed = models.FloatField()
	data_relation = models.ForeignKey(DataRelation)