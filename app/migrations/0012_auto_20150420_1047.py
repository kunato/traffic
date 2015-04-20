# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0011_auto_20150419_2027'),
    ]

    operations = [
        migrations.AddField(
            model_name='mappoint',
            name='alt_latitude',
            field=models.FloatField(null=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='mappoint',
            name='alt_longitude',
            field=models.FloatField(null=True),
            preserve_default=True,
        ),
    ]
