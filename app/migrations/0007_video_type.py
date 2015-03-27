# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0006_auto_20150326_1651'),
    ]

    operations = [
        migrations.AddField(
            model_name='video',
            name='type',
            field=models.IntegerField(default=1),
            preserve_default=False,
        ),
    ]
