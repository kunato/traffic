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
        allowed_methods = ['get','post']

class VideoResource(ModelResource):
	camera = fields.ToOneField( CameraResource, 'camera', full = True )
	class Meta:
		queryset = Video.objects.all()
		resource_name = 'video'
		allowed_methods = ['get','post']
		authentication = SessionAuthentication()
		authorization = DjangoAuthorization()