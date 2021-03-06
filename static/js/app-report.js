//ReportPageController
//Author Kunat Pipatanakul
//Author Tanachor Techajaruphan
app.controller('ReportController', function(restService, $rootScope, $scope, $http, $modal, $log, uiGmapGoogleMapApi, $timeout) {

    var nextId = 0;
    $scope.speedMarker = [];
    $scope.speedMarker2 = [];
    $scope.markers2 = [];
    $scope.realtime = true;
    $scope.opened = {
        status: false
    }
    $scope.datetime = {
        start: new Date((new Date().getTime() - 3 * 60000)),
        end: new Date()
    }
    $scope.init = 0;
    $scope.sliderConfig = {
        min: 0,
        max: 1440,
        step: 15,
        userMin: 0,
        userMax: 720,
    };
    $scope.dialog_datetime = {
        date: new Date($scope.datetime.end)
    }

    $scope.polys = [];

    $scope.duration = 1;
    $scope.render = false;
    $scope.dataRelation = [];
    $scope.alt_dataRelation = [];

    $scope.getDateFromUser = function() {
        if ($scope.init < 2) {
            $scope.init += 1
            return
        }
        var min = parseInt($scope.sliderConfig.userMax, 10);
        var hours = Math.floor(min / 60);
        var minutes = min - (hours * 60);
        $scope.datetime.end = new Date($scope.dialog_datetime.date.getFullYear(), $scope.dialog_datetime.date.getMonth(), $scope.dialog_datetime.date.getDate(), hours, minutes)
        $scope.datetime.start = new Date($scope.datetime.end.getTime() - 15 * 60000)
    }

    $scope.$watch('sliderConfig.userMax', function() {
        var last_value = $scope.sliderConfig.userMax;
        $timeout(function() {
            if (last_value == $scope.sliderConfig.userMax) {
                $scope.getDateFromUser();
            }
        }, 600)
    }, true);
    $scope.$watch('dialog_datetime', function() {
        $scope.getDateFromUser();
    }, true)

    //Open div SLIDER
    $scope.openTraffic = function() {
        $scope.renderdatepicker = true;
        $scope.realtime = false;
        $scope.sliderConfig.userMax = $scope.datetime.end.getHours() * 60 + $scope.datetime.end.getMinutes();
        $scope.dialog_datetime.date = new Date($scope.datetime.end)
        $('#traffic').load(function() {
            //load components
        });

    };

    //Close div SLIDER
    $scope.closeTraffic = function() {
        $scope.renderdatepicker = false;
        $('#traffic').load(function() {
            //load components
        });
    };
    $scope.setRealtime = function() {
        $scope.realtime = true;
    }
    //run every 60 sec to update
    $scope.realtimeUpdate = function() {
        $timeout(function() {
            if ($scope.realtime) {
                $scope.datetime.end = new Date();
                $scope.datetime.start = new Date($scope.datetime.end.getTime() - 3 * 60000);
            }
            $scope.realtimeUpdate();

        }, 60000);
    }
    $scope.realtimeUpdate();
    //openDatePicker
    $scope.openDate = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.opened.status = true;
    };
    $scope.toggleMin = function() {
        $scope.minDate = $scope.minDate ? null : new Date();
    };
    $scope.toggleMin();

    $scope.$watch('datetime', function() {
        console.log('get traffic on update', $scope.datetime)
            //re-render poly line and request traffic from server
        $scope.updateTraffic(0);
        //console.log("datetime change",$scope.datetime)
    }, true);

    //update Traffic is called by datepicker or realtime update
    $scope.updateTraffic = function(i) {
        if (i == $scope.dataRelation.length) {
            $scope.renderPolyline()
            return
        }
        restService.getTrafficFromDataRelation($scope.dataRelation[i].id, $scope.datetime.start, $scope.datetime.end).then(function(response) {
            // console.log('traffic',response.data)
            $scope.dataRelation[i].traffic = response.data.data;
            // console.log($scope.dataRelation)

            $scope.updateTraffic(i + 1);
        });
    }
    //Create DataRelation object in the first time program run
    $scope.getLatLngDataFromDataRelation = function(dataRelation, i, length) {
        if (i == length) {
            $scope.render = true;
            $scope.renderPolyline()
            return;
        }
        restService.getTrafficFromDataRelation(dataRelation[i].id, $scope.datetime.start, $scope.datetime.end).then(function(response) {
            var traffic = response.data
            uiGmapGoogleMapApi.then(function() {
                if (dataRelation[i].alt_path != "") {
                    var _pathObj = JSON.parse(dataRelation[i].alt_path);
                    var path = [];
                    for (var j = 0; j < _pathObj.path.length; j++) {
                        path.push(new google.maps.LatLng(_pathObj.path[j].k, _pathObj.path[j].B))
                    }
                    $scope.alt_dataRelation.push({
                        id: dataRelation[i].id,
                        path: path,
                        description: _pathObj.summary,
                        distance: _pathObj.distance.value
                    });
                } else {
                    $scope.alt_dataRelation.push({})
                }
                if (dataRelation[i].path != "") {
                    var _pathObj = JSON.parse(dataRelation[i].path);
                    var path = [];
                    for (var j = 0; j < _pathObj.path.length; j++) {
                        path.push(new google.maps.LatLng(_pathObj.path[j].k, _pathObj.path[j].B))
                    }
                    $scope.dataRelation.push({
                            id: dataRelation[i].id,
                            path: path,
                            traffic: traffic.data,
                            description: _pathObj.summary,
                            distance: _pathObj.distance.value,
                            cameraPoint1: dataRelation[i].cameraPoint1.mapPoint,
                            cameraPoint2: dataRelation[i].cameraPoint2.mapPoint,
                            one_way: dataRelation[i].one_way
                        })
                }
                $scope.getLatLngDataFromDataRelation(dataRelation, i + 1, length);
            });
        });
    }
    restService.getDataRelation().then(function(response) {
        var dataRelation = response.data.objects
        var i = 0;
        $scope.getLatLngDataFromDataRelation(dataRelation, i, dataRelation.length);

    });
    $scope.createSpeedMarker = function(lat, lng, number) {
        var icon = number;
        if (number > 99) {
            icon = 99;
        }
        return {
            id: nextId += 1,
            coords: {
                latitude: lat,
                longitude: lng
            },
            icon: '/static/img/number/red' + Math.floor(number) + '.png',
            speed: number
        }
    }
    //renderPolyline is called when traffic update
    $scope.renderPolyline = function() {
        nextId = 0;
        $scope.speedMarker = [];
        $scope.polys = [];
        for (var i = 0; i < $scope.dataRelation.length; i++) {

            var icons = [{
                id: $scope.dataRelation[i].id,
                icon: {
                    path: google.maps.SymbolPath.FORWARD_OPEN_ARROW
                },
                offset: '100px',
                repeat: '200px'
            }]
            var path1 = angular.copy($scope.dataRelation[i].path);
            $scope.polys.push({})
            var index = $scope.polys.length - 1
            $scope.polys[index].id = $scope.dataRelation[i].id
            $scope.polys[index].path = path1
            $scope.polys[index].stroke = {
                color: getColorFromTraffic($scope.dataRelation[i].traffic[0].speed, $scope.dataRelation[i].traffic[0].count),
                weight: 1.5,
                opacity: 1.0
            }
            var events = {
                click: function(mapModel, eventName, originalEventArgs) {
                    var id = originalEventArgs.icons.id
                    $scope.open(id);
                }
            }
            var center = Math.floor(($scope.polys[index].path.length - 1) / 2)
            $scope.speedMarker.push($scope.createSpeedMarker(($scope.polys[index].path[center].lat() + $scope.polys[index].path[center + 1].lat()) / 2.0, ($scope.polys[index].path[center].lng() + $scope.polys[index].path[center + 1].lng()) / 2.0,
                $scope.dataRelation[i].traffic[0].speed))
            $scope.polys[index].events = events;
            $scope.polys[index].icons = icons;
            $scope.polys[index].icons.id = $scope.polys[index].id
            if ($scope.dataRelation[i].one_way == true) {
                continue;
            }

            if ($scope.alt_dataRelation[i].id != undefined) {
                var path = $scope.alt_dataRelation[i].path
                var icon2 = icons;
            } else {
                var path = angular.copy($scope.dataRelation[i].path)
                var icon2 = [{
                    id: $scope.dataRelation[i].id,
                    icon: {
                        path: google.maps.SymbolPath.BACKWARD_OPEN_ARROW
                    },
                    offset: '100px',
                    repeat: '200px'
                }]
                //calculate from average of all path
                //still not implement
                // for (var j = 0; j < path.length; j++) {
                //     
                // }
            }
            var events = {
                click: function(mapModel, eventName, originalEventArgs) {
                    var id = originalEventArgs.icons.id
                    $scope.open(id);
                }
            }

            $scope.polys.push({})
            var index = $scope.polys.length - 1
            $scope.polys[index].id = $scope.dataRelation[i].id
            $scope.polys[index].path = path
            $scope.polys[index].stroke = {
                color: getColorFromTraffic($scope.dataRelation[i].traffic[1].speed, $scope.dataRelation[i].traffic[1].count),
                weight: 1.5,
                opacity: 1.0
            }
            $scope.speedMarker.push($scope.createSpeedMarker((($scope.polys[index].path[center].lat() + $scope.polys[index].path[center + 1].lat()) / 2.0), (($scope.polys[index].path[center].lng() + $scope.polys[index].path[center + 1].lng()) / 2.0), $scope.dataRelation[i].traffic[1].speed))
            $scope.polys[index].events = events;
            $scope.polys[index].icons = icon2;
            $scope.polys[index].icons.id = $scope.polys[index].id;
        }
        $scope.speedMarker2 = []
        for (var i = 0; i < $scope.speedMarker.length; i++) {
            if ($scope.speedMarker[i].speed != 0) {
                $scope.speedMarker2.push($scope.speedMarker[i]);
            }
        }
    }
    restService.getMap().then(function(response) {
        $scope.map = {
            center: {
                latitude: response.data.objects[0].center_lat,
                longitude: response.data.objects[0].center_lng
            },
            zoom: response.data.objects[0].zoom,
            events: {
                //click to mark
                click: function(mapModel, eventName, originalEventArgs) {
                    var e = originalEventArgs[0];
                    var lat = e.latLng.lat(),
                        lon = e.latLng.lng();
                    if ($scope.markers2.length == 2) {
                        $scope.markers2 = [];
                        $scope.polys2 = [];
                    }
                    $scope.markers2.push({
                        id: nextId,
                        options: {
                            draggable: true,
                        },
                        latitude: lat,
                        longitude: lon
                    });
                    nextId -= 1;
                    $scope.$apply();
                }
            }
        }
        $scope.map_id = response.data.objects[0].resource_uri;
    });
    
    $scope.onMarkerClicked = function(marker) {
        marker.showWindow = true;
        $scope.$apply();
    };
    //edit Detail Time window
    $scope.editTime = function() {
        var modalInstance = $modal.open({
            templateUrl: '/static/html/modal_time.html',
            controller: 'ModalTimeCtrl',
            size: 'sm',
            resolve: {
                datetime: function() {
                    return $scope.datetime;
                }
            }
        });

        modalInstance.result.then(function() {
            $scope.closeTraffic();
        });
    }
    //Open detail page
    $scope.open = function(id) {
        var object = undefined;
        for (var i = 0; i < $scope.dataRelation.length; i++) {
            if (id == $scope.dataRelation[i].id) {
                object = $scope.dataRelation[i]
            }
        }
        var modalInstance = $modal.open({
            templateUrl: '/static/html/modal_report.html',
            controller: 'ModalReportCtrl',
            size: 'lg',
            resolve: {
                item: function() {
                    return object;
                },
                datetime: function() {
                    return $scope.datetime;
                }
            }
        });

        // modalInstance.result.then(function (selectedItem) {
        //   $scope.selected = selectedItem;
        // }, function () {
        //   //$log.info('Modal dismissed at: ' + new Date());
        // });
    };
});

//EditTimeController
//Author Kunat Pipatanakul
app.controller('ModalTimeCtrl', function(restService, $scope, $modalInstance, datetime) {
    $scope.datetime = datetime;
    //console.log(datetime.end)
    datetime.start.setMilliseconds(0)
    datetime.end.setMilliseconds(0)
    $scope.start = datetime.start
    $scope.end = datetime.end
    $scope.open_start = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.opened1 = true;
    };
    $scope.open_end = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.opened2 = true;
    };

    $scope.ok = function() {
        $scope.datetime.start = $scope.start
        $scope.datetime.end = $scope.end
        $modalInstance.close();

    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

});
//ReportDetailController
//Author Tanachot Techajaruphan
app.controller('ModalReportCtrl', function(restService, $filter, $scope, $modalInstance, item, datetime) {
    //console.log(item);
    $scope.render = false
    $scope.item = item;
    console.log($scope.item);
    $scope.data = [
        [],
        []
    ];
    $scope.data2 = [
        [],
        []
    ];
    $scope.timeData = [];
    var start = datetime.start.getTime();
    var end = datetime.end.getTime();
    var diff = end - start;
    $scope.labels = [];
    diff /= 11
    for (var i = 0; i < 11; i++) {
        $scope.timeData.push(new Date(start + (diff * i)))
    }
    $scope.getTraffic = function(current, timeData) {
        if (current == timeData.length - 1) {
            $scope.render = true;
            return
        }

        restService.getTrafficFromDataRelation($scope.item.id, timeData[current], timeData[current + 1]).then(function(response) {
            var traffic_data = response.data.data
            $scope.data[0].push(traffic_data[0].speed)
            $scope.data[1].push(traffic_data[1].speed)

            $scope.data2[0].push(traffic_data[0].count)
            $scope.data2[1].push(traffic_data[1].count)
            $scope.getTraffic(current + 1, timeData)

            $scope.labels.push($filter('date')($scope.timeData[current], 'short'))
        });
    }
    $scope.getTraffic(0, $scope.timeData);

    $scope.series = [$scope.item.description + ' Inbound', $scope.item.description + ' Outbound'];
    $scope.table = [{
        title: $scope.series[0],
        value: $scope.data[0]
    }, {
        title: $scope.series[1],
        value: $scope.data[1]
    }];

    $scope.table2 = [{
        title: $scope.series[0],
        value: $scope.data2[0]
    }, {
        title: $scope.series[1],
        value: $scope.data2[1]
    }];

    $scope.ok = function() {
        $modalInstance.close();
    };
    $scope.export = function() {

        var temp1 = $scope.data[0];
        temp1.unshift('Speed ' + $scope.series[0]);

        var temp2 = $scope.data[1];
        temp2.unshift('Speed ' + $scope.series[1]);

        var temp3 = $scope.data2[0];
        temp3.unshift('Number of Car ' + $scope.series[0]);

        var temp4 = $scope.data2[1];
        temp4.unshift('Number of Car ' + $scope.series[1]);

        var temp5 = $scope.labels;
        temp5.unshift("Way / Date-time");

        var data = [temp5, temp1, temp2, temp3, temp4];

        var csvContent = "data:text/csv;charset=utf-8,";
        data.forEach(function(infoArray, index) {
            dataString = infoArray.join(",");
            csvContent += index < data.length ? dataString + "\n" : dataString;
        });
        var encodedUri = encodeURI(csvContent);
        window.open(encodedUri);

    };
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

});