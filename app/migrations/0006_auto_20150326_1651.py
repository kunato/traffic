# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0005_remove_videodata_process'),
    ]

    operations = [
        migrations.RenameField(
            model_name='videodata',
            old_name='appear_position_x',
            new_name='speed',
        ),
        migrations.RemoveField(
            model_name='videodata',
            name='appear_position_y',
        ),
        migrations.RemoveField(
            model_name='videodata',
            name='camera',
        ),
        migrations.RemoveField(
            model_name='videodata',
            name='diff_time',
        ),
        migrations.RemoveField(
            model_name='videodata',
            name='last_position_x',
        ),
        migrations.RemoveField(
            model_name='videodata',
            name='last_position_y',
        ),
        migrations.AddField(
            model_name='videodata',
            name='data_relation',
            field=models.ForeignKey(default=1, to='app.DataRelation'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='videodata',
            name='go_to',
            field=models.IntegerField(default=0),
            preserve_default=False,
        ),
    ]
