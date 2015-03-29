"""
Celery tasks
"""
from models import *
from celery import task, current_task
import tracking


@task()
def process(video, message):
    # print message
    if(video.camera.url == ''):
        img = tracking.saveImg(video.url,[])
        video.camera.url = img
        video.camera.save()
    #get data
    dataRelation = DataRelation.objects.get(camera=video.camera)
    current_task.update_state(state='PROGRESS', meta={'process_percent': 10})
    tracking.process(video,dataRelation)

    current_task.update_state(state='PROGRESS', meta={'process_percent': 100})
    print "task finish"

def get_task_status(task_id):
 
    # If you have a task_id, this is how you query that task 
    task = progress.AsyncResult(task_id)
 
    status = task.status
    progress = 0
 
    if status == u'SUCCESS':
        progress = 100
    elif status == u'FAILURE':
        progress = 0
    elif status == 'PROGRESS':
        progress = 50
 
    return {'status': status, 'progress': progress}