# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0009_datarelation_one_way'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='video',
            name='status',
        ),
        migrations.AlterField(
            model_name='datarelation',
            name='one_way',
            field=models.BooleanField(default=False),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='video',
            name='start_time',
            field=models.DateTimeField(null=True),
            preserve_default=True,
        ),
    ]
