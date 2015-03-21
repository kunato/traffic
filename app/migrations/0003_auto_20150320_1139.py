# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import datetime
from django.utils.timezone import utc


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0002_video'),
    ]

    operations = [
        migrations.AddField(
            model_name='car',
            name='appear_time',
            field=models.DateTimeField(default=datetime.datetime(2015, 3, 20, 11, 39, 46, 285612, tzinfo=utc)),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='video',
            name='url',
            field=models.CharField(default='', max_length=200),
            preserve_default=False,
        ),
    ]
