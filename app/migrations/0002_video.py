# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Video',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=200)),
                ('start_time', models.DateTimeField()),
                ('status', models.FloatField()),
                ('camera', models.ForeignKey(to='app.Camera')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
