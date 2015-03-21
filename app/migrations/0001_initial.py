# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Camera',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=200)),
                ('url', models.CharField(max_length=200)),
                ('height', models.IntegerField()),
                ('width', models.IntegerField()),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='CameraPoint',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=200)),
                ('top', models.FloatField()),
                ('left', models.FloatField()),
                ('height', models.FloatField()),
                ('width', models.FloatField()),
                ('length', models.FloatField()),
                ('camera', models.ForeignKey(to='app.Camera')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Car',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=200)),
                ('appear_position_x', models.IntegerField()),
                ('appear_position_y', models.IntegerField()),
                ('last_position_x', models.IntegerField()),
                ('last_position_y', models.IntegerField()),
                ('diff_time', models.IntegerField()),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='DataRelation',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=200)),
                ('camera_length', models.IntegerField()),
                ('map_length', models.IntegerField()),
                ('cameraPoint1', models.ForeignKey(related_name='camera_start', to='app.CameraPoint')),
                ('cameraPoint2', models.ForeignKey(related_name='camera_end', to='app.CameraPoint')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Map',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=200)),
                ('url', models.CharField(max_length=200)),
                ('height', models.IntegerField()),
                ('width', models.IntegerField()),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='MapPoint',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=200)),
                ('color', models.CharField(max_length=8)),
                ('top', models.FloatField()),
                ('left', models.FloatField()),
                ('map', models.ForeignKey(to='app.Map')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.AddField(
            model_name='car',
            name='data_relation',
            field=models.ForeignKey(to='app.DataRelation'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='camerapoint',
            name='mapPoint',
            field=models.ForeignKey(to='app.MapPoint'),
            preserve_default=True,
        ),
    ]
