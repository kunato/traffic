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
import dateutil.parser
@ensure_csrf_cookie
def index(request):
    return redirect('/app/')

def login_view(request):
    if(request.method == "POST"):
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(username=username, password=password)
        if user is not None:
            if user.is_active:
                login(request, user)
                return redirect('/setting/')
                # Redirect to a success page.
            else:
                return HttpResponse("error")
                # Return a 'disabled account' error message
        else:
            return HttpResponse("error")
    else:
        if(request.user.is_authenticated()):
            return redirect('/setting/')
        else:
            return render(request,'login.html')

@ensure_csrf_cookie
def app(request):
    return render(request, 'index.html')
    
def setting(request):
    if(request.user.is_authenticated()):
        return render(request, 'setting.html')
    else:
        return redirect('/login/')

def upload(request):
    if(request.user.is_authenticated()):
        if(request.method == "POST"):
            print request.POST
            f = request.FILES['file']
            #change to Camera.objects.get(pk=request.POST['camera_id'])
            # 0 = oneway 1 = bi-direction
            cam = Camera.objects.get(pk=request.POST['id'])
            video = Video(name="", url="", camera=cam, start_time=dateutil.parser.parse(request.POST['datetime']),added_time=datetime.datetime.now(),type=1)
            video.save()
            url = helper.saveFile(video.id,f.name.split('.')[-1],f)
            video.url = url
            video.save()
            process_obj = process.delay(video=video)
            video.tracking_id = process_obj.id
            video.save()
            return JsonResponse({'job_id':process_obj.id})
        else:

            return JsonResponse({'progress':''})
    else:
        return redirect('/')
def resume(request):
    if(request.user.is_authenticated()):
        video = Video.objects.get(pk=json.loads(request.body)['id'])
        if(video.type == 2):
            video.type = 1
        if(video.type == 3):
            video.type = 0
        video.save()
        process_obj = process.delay(video=video)
        video.tracking_id = process_obj.id
        video.save()
        return JsonResponse({'job_id':process_obj.id})
    else:
        return redirect('/')

def stream(request):
    if(request.user.is_authenticated()):
        if(request.method == "POST"):
            dict_request = json.loads(request.body)
            cam = Camera.objects.get(pk=dict_request['id'])
            video = Video(name="", url=dict_request['url'], camera=cam,added_time=datetime.datetime.now(),type=0)
            video.save()
            process_obj = process_stream.delay(video=video)
            video.tracking_id = process_obj.id
            video.save()
            return JsonResponse({'job_id':process_obj.id})
        return JsonResponse({'progress':''})
    return redirect('/')
    
def state(request):
    task_id = request.GET['task_id']
    task = get_task_status(task_id)
    return JsonResponse({'task':task['progress'],'status':task['status']})
    
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