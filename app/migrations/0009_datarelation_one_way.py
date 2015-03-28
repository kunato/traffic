# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0008_auto_20150328_0304'),
    ]

    operations = [
        migrations.AddField(
            model_name='datarelation',
            name='one_way',
            field=models.BooleanField(default=False),
            preserve_default=False,
        ),
    ]
