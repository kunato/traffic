# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0003_auto_20150324_1717'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='videodata',
            name='video',
        ),
        migrations.AddField(
            model_name='videodata',
            name='camera',
            field=models.ForeignKey(default=1, to='app.Camera'),
            preserve_default=False,
        ),
    ]
