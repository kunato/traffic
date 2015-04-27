"""
Celery tasks
"""
from models import *
from celery import task, current_task
import tracking
from celery.result import AsyncResult

@task()
def process(video):
    current_task.update_state(state='PROGRESS', meta={'process_percent': 1})
    # print message
    if(video.camera.url == ''):
        current_task.update_state(state='PROGRESS', meta={'process_percent': 10})
        img = tracking.saveImg(video.url,[])
        video.camera.url = img
        video.camera.save()
        video.type = 2
        video.save()
        current_task.update_state(state='PROGRESS', meta={'process_percent': 10})
    else:
    #get data
        dataRelation = DataRelation.objects.get(camera=video.camera)
        current_task.update_state(state='PROGRESS', meta={'process_percent': 10})
        tracking.process(video,dataRelation)

        current_task.update_state(state='PROGRESS', meta={'process_percent': 100})
    
    print "task finish"

@task()
def process_stream(video):
    current_task.update_state(state='PROGRESS', meta={'process_percent': 1})
    dataRelation = DataRelation.objects.get(camera=video.camera)
    current_task.update_state(state='PROGRESS', meta={'process_percent': 100})
    #never finish
    tracking.process(video,dataRelation)
    current_task.update_state(state='PROGRESS', meta={'process_percent': 100})
    print "task finish"
def get_task_status(task_id):
 
    # If you have a task_id, this is how you query that task 
    task = AsyncResult(task_id)
 
    status = task.status
    progress = 0
 
    if status == u'SUCCESS':
        progress = 100
    elif status == u'FAILURE':
        progress = 0
    elif status == 'PROGRESS':
        progress = task.result['process_percent']
 
    return {'status': status, 'progress': progress}