# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0010_auto_20150329_2249'),
    ]

    operations = [
        migrations.AddField(
            model_name='video',
            name='added_time',
            field=models.DateTimeField(null=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='video',
            name='tracking_id',
            field=models.CharField(max_length=200, null=True),
            preserve_default=True,
        ),
    ]
