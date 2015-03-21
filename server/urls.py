from django.conf.urls import patterns, include, url
from django.contrib import admin
from app import views
from app.api import *
from tastypie.api import Api
v1_api = Api()
v1_api.register(CameraResource())
v1_api.register(VideoResource())
urlpatterns = patterns('',
url(r'^$',views.index),
url(r'^app/', views.app),
url(r'^upload/',views.upload),
url(r'^logout/', views.logout_view),
url(r'^api/', include(v1_api.urls)),
url(r'^admin/', include(admin.site.urls)),
)
