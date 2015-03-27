from tastypie import fields
from tastypie.resources import ModelResource, ALL, ALL_WITH_RELATIONS
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
		filtering = {
            'id': ALL,
        }

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



class MapPointResource(ModelResource):
	map = fields.ToOneField(MapResource,'map',full=True)
	class Meta:
		always_return_data = True
		queryset = MapPoint.objects.all()
		resource_name = 'mapPoint'
		allowed_methods = ['get','post','put','delete']
		authentication = SessionAuthentication()
		authorization = DjangoAuthorization()

class CameraPointResource(ModelResource):
	mapPoint = fields.ToOneField( MapPointResource,'mapPoint',full = True)
	class Meta:
		always_return_data = True
		queryset = CameraPoint.objects.all()
		resource_name = 'cameraPoint'
		allowed_methods = ['get','post','put','delete']
		authentication = SessionAuthentication()
		authorization = DjangoAuthorization()

class DataRelationResource(ModelResource):

	camera = fields.ToOneField( CameraResource, 'camera', full = True)
	cameraPoint1 = fields.ToOneField(CameraPointResource,'cameraPoint1')
	cameraPoint2 = fields.ToOneField(CameraPointResource,'cameraPoint2')
	class Meta:
		always_return_data = True
		queryset = DataRelation.objects.all()
		resource_name = 'dataRelation'
		allowed_methods = ['get','post','put','delete']
		authentication = SessionAuthentication()
		authorization = DjangoAuthorization()
		filtering = {
            'camera': ALL_WITH_RELATIONS,
        }
