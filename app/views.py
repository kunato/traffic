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
import numpy as np
@ensure_csrf_cookie
def index(request):
    if(request.method == "POST"):
        username = request.POST['username']
        password = request.POST['password']
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
    else:
        return render(request,'login.html')
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
            #change to Camera.objects.get(pk=request.POST['camera_id'])
            # 0 = oneway 1 = bi-direction
            cam = Camera.objects.all()[1]
            video = Video(name="", url="", camera=cam, start_time=datetime.datetime.now(), status=0.0,type=1)
            video.save()
            url = helper.saveFile(video.id,f.name.split('.')[-1],f)
            video.url = url
            video.save()
            process.delay(video=video,message="test")
            return HttpResponse("FIN")
        else:
            return render(request, 'upload.html')
    else:
        return redirect('/')

def traffic(request):
    data_relation_id = request.GET['id']
    start = request.GET['start']
    #start = datetime.datetime(2015,1,28)
    end = request.GET['end']
    #end = datetime.datetime(2015,4,1)
    data_relation = DataRelation.objects.get(pk=data_relation_id)
    v_data = VideoData.objects.filter(data_relation=data_relation,appear_time__range=(start,end))
    sum_speed = np.zeros((2), dtype=np.float)
    count = np.zeros((2),dtype=np.int)
    for i in v_data:
        if(i.go_to == 0):
            sum_speed[0] += i.speed
            count[0] += 1
        else:
            sum_speed[1] += i.speed
            count[1] += 1
    if(count[0] != 0):
        sum_speed[0] /= count[0]
    if(count[1] != 0):
        sum_speed[1] /= count[1]
    #genarate Traffic object from data relation and time, duration
    #change to json response
    return JsonResponse({'data_relation_id':data_relation_id,'data':[{'speed':sum_speed[0],'count':count[0]},{'speed':sum_speed[1],'count':count[1]}]})


def logout_view(request):
    logout(request)
    return redirect('/')