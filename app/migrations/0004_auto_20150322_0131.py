# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0003_auto_20150320_1139'),
    ]

    operations = [
        migrations.CreateModel(
            name='VideoData',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('appear_position_x', models.FloatField()),
                ('appear_position_y', models.FloatField()),
                ('last_position_x', models.FloatField()),
                ('last_position_y', models.FloatField()),
                ('diff_time', models.FloatField()),
                ('appear_time', models.DateTimeField()),
                ('process', models.IntegerField()),
                ('video', models.ForeignKey(to='app.Video')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.RemoveField(
            model_name='car',
            name='appear_position_x',
        ),
        migrations.RemoveField(
            model_name='car',
            name='appear_position_y',
        ),
        migrations.RemoveField(
            model_name='car',
            name='appear_time',
        ),
        migrations.RemoveField(
            model_name='car',
            name='diff_time',
        ),
        migrations.RemoveField(
            model_name='car',
            name='last_position_x',
        ),
        migrations.RemoveField(
            model_name='car',
            name='last_position_y',
        ),
        migrations.AddField(
            model_name='car',
            name='speed',
            field=models.FloatField(default=0),
            preserve_default=False,
        ),
    ]
