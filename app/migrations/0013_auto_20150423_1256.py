# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0012_auto_20150420_1047'),
    ]

    operations = [
        migrations.AddField(
            model_name='datarelation',
            name='alt_path',
            field=models.TextField(default='', max_length=1000),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='datarelation',
            name='path',
            field=models.TextField(default='', max_length=1000),
            preserve_default=False,
        ),
    ]
