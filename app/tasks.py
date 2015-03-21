"""
Celery tasks
"""

from celery import task
import tracking


@task()
def process(path, message):
	print message
	out = tracking.process(path)
	ins = open(out,"r")
	print "save to db"
	for line in ins:
		print line
	ins.close()
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