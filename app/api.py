from tastypie import fields
from tastypie.resources import ModelResource, ALL, ALL_WITH_RELATIONS
from auth import AnonymousGetAuthentication
from tastypie.authorization import DjangoAuthorization
from app.models import *

TASTYPIE_FULL_DEBUG = False
API_LIMIT_PER_PAGE = 50

class CameraResource(ModelResource):
	class Meta:

		always_return_data = True
		queryset = Camera.objects.all()
		resource_name = 'camera'

		authentication = AnonymousGetAuthentication()
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
		authentication = AnonymousGetAuthentication()
		authorization = DjangoAuthorization()
		ordering = {
			'added_time'
		}
		filtering = {
            'camera': ALL_WITH_RELATIONS,
        }
class MapResource(ModelResource):
	class Meta:
		queryset = Map.objects.all()
		resource_name = 'map'
		allowed_methods = ['get','post']
		authentication = AnonymousGetAuthentication()
		authorization = DjangoAuthorization()



class MapPointResource(ModelResource):
	map = fields.ToOneField(MapResource,'map',full=True)
	class Meta:
		always_return_data = True
		queryset = MapPoint.objects.all()
		resource_name = 'mapPoint'
		allowed_methods = ['get','post','put','delete']
		authentication = AnonymousGetAuthentication()
		authorization = DjangoAuthorization()

class CameraPointResource(ModelResource):
	mapPoint = fields.ToOneField( MapPointResource,'mapPoint',full = True)
	class Meta:
		always_return_data = True
		queryset = CameraPoint.objects.all()
		resource_name = 'cameraPoint'
		allowed_methods = ['get','post','put','delete']
		authentication = AnonymousGetAuthentication()
		authorization = DjangoAuthorization()

class DataRelationResource(ModelResource):

	camera = fields.ToOneField( CameraResource, 'camera', full = True)
	cameraPoint1 = fields.ToOneField(CameraPointResource,'cameraPoint1',full = True)
	cameraPoint2 = fields.ToOneField(CameraPointResource,'cameraPoint2', full = True)
	class Meta:
		always_return_data = True
		queryset = DataRelation.objects.all()
		resource_name = 'dataRelation'
		allowed_methods = ['get','post','put','delete']
		authentication = AnonymousGetAuthentication()
		authorization = DjangoAuthorization()
		filtering = {
            'camera': ALL_WITH_RELATIONS,
            'id':ALL,
        }
