# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0007_video_type'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='datarelation',
            name='map_length',
        ),
        migrations.AddField(
            model_name='datarelation',
            name='camera_aspect',
            field=models.FloatField(default=1.0),
            preserve_default=False,
        ),
    ]
