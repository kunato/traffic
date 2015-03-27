# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0002_auto_20150324_1623'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='camerapoint',
            name='camera',
        ),
        migrations.AddField(
            model_name='datarelation',
            name='camera',
            field=models.ForeignKey(default=1, to='app.Camera'),
            preserve_default=False,
        ),
    ]
