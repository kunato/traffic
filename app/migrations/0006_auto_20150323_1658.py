# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0005_remove_camerapoint_length'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='camerapoint',
            name='mapPoint',
        ),
        migrations.AddField(
            model_name='mappoint',
            name='cameraPoint',
            field=models.ForeignKey(default='', to='app.CameraPoint'),
            preserve_default=False,
        ),
    ]
