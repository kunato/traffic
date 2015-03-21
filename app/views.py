from django.shortcuts import render,redirect
from django.http import HttpResponse,JsonResponse
from models import *
from app.tasks import *
import json
import helper
import datetime
import simplejson
from django.core import serializers
from django.contrib.auth import authenticate, login , logout
from django.views.decorators.csrf import ensure_csrf_cookie
@ensure_csrf_cookie
def index(request):
    username = request.GET['username']
    password = request.GET['password']
    user = authenticate(username=username, password=password)
    if user is not None:
        if user.is_active:
            login(request, user)
            return redirect('/app/')
            # Redirect to a success page.
        else:
        	return HttpResponse("error")
            # Return a 'disabled account' error message
    else:
    	return HttpResponse("error")
        # Return an 'invalid login' error message.

@ensure_csrf_cookie
def app(request):
    if(request.user.is_authenticated()):
	   return render(request, 'index.html')
    else:
        return redirect('/')

def upload(request):
    if(request.user.is_authenticated()):
        if(request.method == "POST"):
            f = request.FILES['sentFile']
            cam = Camera.objects.all()[0]
            video = Video(name="",url="",camera=cam,start_time=datetime.datetime.now(),status=0.0)
            video.save()
            url = helper.saveFile(video.id,f.name.split('.')[-1],f)
            video.url = url
            video.save()
            process.delay(path=url,message="test")
            return HttpResponse("FIN")
        else:
            return render(request, 'upload.html')
    else:
        return redirect('/')

def logout_view(request):
    logout(request)
    return HttpResponse("OK");