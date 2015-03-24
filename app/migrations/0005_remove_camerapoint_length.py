# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0004_auto_20150322_0131'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='camerapoint',
            name='length',
        ),
    ]
