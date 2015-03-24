from tastypie import fields
from tastypie.resources import ModelResource
from tastypie.authentication import SessionAuthentication
from tastypie.authorization import DjangoAuthorization
from app.models import *


class CameraResource(ModelResource):
    class Meta:
        queryset = Camera.objects.all()
        resource_name = 'camera'

        authentication = SessionAuthentication()
        authorization = DjangoAuthorization()
        allowed_methods = ['get','post','put','delete']

class VideoResource(ModelResource):
	camera = fields.ToOneField( CameraResource, 'camera', full = True )
	class Meta:
		queryset = Video.objects.all()
		resource_name = 'video'
		allowed_methods = ['get','post']
		authentication = SessionAuthentication()
		authorization = DjangoAuthorization()
class MapResource(ModelResource):
	class Meta:
		queryset = Map.objects.all()
		resource_name = 'map'
		allowed_methods = ['get','post']
		authentication = SessionAuthentication()
		authorization = DjangoAuthorization()
class CameraPointResource(ModelResource):
	camera = fields.ToOneField( CameraResource, 'camera', full = True)
	class Meta:
		queryset = CameraPoint.objects.all()
		resource_name = 'cameraPoint'
		allowed_methods = ['get','post','put','delete']
		authentication = SessionAuthentication()
		authorization = DjangoAuthorization()

class MapPointResource(ModelResource):
	map = fields.ToOneField( MapResource, 'map', full = True)
	cameraPoint = fields.ToOneField( CameraPointResource, 'cameraPoint' ,full = True)
	class Meta:
		queryset = MapPoint.objects.all()
		resource_name = 'mapPoint'
		allowed_methods = ['get','post','put','delete']
		authentication = SessionAuthentication()
		authorization = DjangoAuthorization()
