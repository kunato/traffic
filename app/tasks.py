"""
Celery tasks
"""
from models import *
from celery import task, current_task
import tracking
from celery.result import AsyncResult
#Task for process video file (video.type = 1,2)
@task()
def process(video):
    current_task.update_state(state='PROGRESS', meta={'process_percent': 1})
    if(video.camera.url == ''):
        current_task.update_state(state='PROGRESS', meta={'process_percent': 10})
        img = tracking.saveImg(video.url,[])
        video.camera.url = img
        video.camera.save()
        video.type = 2
        video.save()
        current_task.update_state(state='PROGRESS', meta={'process_percent': 10})
    else:
        dataRelation = DataRelation.objects.get(camera=video.camera)
        current_task.update_state(state='PROGRESS', meta={'process_percent': 10})
        tracking.process(video,dataRelation)

        current_task.update_state(state='PROGRESS', meta={'process_percent': 100})
    
    print "task finish"

#Task for processing stream (video.type = 0,3)
@task()
def process_stream(video):
    current_task.update_state(state='PROGRESS', meta={'process_percent': 1})
    dataRelation = DataRelation.objects.get(camera=video.camera)
    current_task.update_state(state='PROGRESS', meta={'process_percent': 100})
    tracking.process(video,dataRelation)
    current_task.update_state(state='PROGRESS', meta={'process_percent': 100})
    print "task finish"
    
#Method for getting progress of the task
def get_task_status(task_id):
 
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