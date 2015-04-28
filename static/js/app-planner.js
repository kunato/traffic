app.controller('PlannerController', function(restService, $rootScope, $scope, $http, $modal, $log, uiGmapGoogleMapApi, $timeout) {
    $scope.speedMarker = [];
    $scope.speedMarker2 = [];
    $scope.markers2 = [];
    //Slider
    $scope.realtime = true;
    $scope.opened = {
        status: false
    }
    $scope.datetime = {
        start: new Date((new Date().getTime() - 1 * 60000)),
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
            // console.log($scope.datetime)
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
    $scope.realtimeUpdate = function() {
        // console.log('update traffic')
        $timeout(function() {
            if ($scope.realtime) {
                $scope.datetime.end = new Date();
                $scope.datetime.start = new Date($scope.datetime.end.getTime() - 1 * 60000);
            }
            $scope.realtimeUpdate();

        }, 60000);
    }
    $scope.realtimeUpdate();

    $scope.openDate = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.opened.status = true;
    };
    $scope.toggleMin = function() {
        $scope.minDate = $scope.minDate ? null : new Date();
    };
    $scope.toggleMin();


    $scope.calculateRoute = function() {
        var backup_dataRelation = angular.copy($scope.dataRelation)
            //markers2 [0] is start [1] is end
        var latlng_start = new google.maps.LatLng($scope.markers2[0].latitude, $scope.markers2[0].longitude)
        var latlng_end = new google.maps.LatLng($scope.markers2[1].latitude, $scope.markers2[1].longitude)
        var g = new Graph();
        var traffic_data = []

        for (var i = 0; i < $scope.dataRelation.length; i++) {
            for (var j = 0; j < $scope.dataRelation[i].traffic.length; j++) {
                if ($scope.dataRelation[i].traffic[j].speed == 0) {
                    $scope.dataRelation[i].traffic[j].speed = 30;
                }
            }
            var obj = {}
            obj[$scope.dataRelation[i].cameraPoint2.id] = $scope.dataRelation[i].distance / $scope.dataRelation[i].traffic[0].speed
            g.addVertex($scope.dataRelation[i].cameraPoint1.id, obj);

            if (!$scope.dataRelation[i].one_way) {
                var obj = {}
                obj[$scope.dataRelation[i].cameraPoint1.id] = $scope.dataRelation[i].distance / $scope.dataRelation[i].traffic[1].speed
                g.addVertex($scope.dataRelation[i].cameraPoint2.id, obj);
            } else {
                var obj = {}
                g.addVertex($scope.dataRelation[i].cameraPoint2.id, obj)
            }

        }

        var start_min_index = -1;
        var start_min_node = -1;
        var end_min_index = -1;
        var end_min_node = -1;
        var end_min = 1.0 / 0;
        var start_min = 1.0 / 0;
        for (var i = 0; i < $scope.dataRelation.length; i++) {
            for (var j = 0; j < $scope.dataRelation[i].path.length - 1; j++) {
                var distance = getDistance($scope.dataRelation[i].path[j], $scope.dataRelation[i].path[j + 1]);
                var divideBy = Math.floor(distance / 20);
                var diff = [($scope.dataRelation[i].path[j + 1].B - $scope.dataRelation[i].path[j].B) / divideBy, ($scope.dataRelation[i].path[j + 1].k - $scope.dataRelation[i].path[j].k) / divideBy]

                for (var k = 1; k < divideBy; k++) {
                    if ((j == 0 && k == 0) || (k == divideBy && j == $scope.dataRelation[i].path.length - 2)) {
                        continue
                    }
                    if (k > divideBy / 2) {
                        var check_pos = new google.maps.LatLng($scope.dataRelation[i].path[j + 1].k - (diff[1] * (divideBy - k)), $scope.dataRelation[i].path[j + 1].B - (diff[0] * (divideBy - k)));
                    } else {
                        var check_pos = new google.maps.LatLng($scope.dataRelation[i].path[j].k + (diff[1] * k), $scope.dataRelation[i].path[j].B + (diff[0] * k));
                    }
                    var value = getDistance(check_pos, latlng_start)
                        // $scope.markers2.push({
                        //   id: nextId,
                        //   latitude: check_pos.lat(),
                        //   longitude: check_pos.lng()
                        // });
                    if (value < start_min) {
                        start_min = value;
                        start_min_index = i;
                    }
                    var value2 = getDistance(check_pos, latlng_end)
                    if (value2 < end_min) {
                        end_min = value2;
                        end_min_index = i;
                    }
                }


            }
        }
        //check if start_min_index == end_min_index
        if (start_min_index == end_min_index) {
            var start_path_temp = $scope.dataRelation[start_min_index].path
            var save_start_path = []
            for (var i = 0; i < start_path_temp.length - 1; i++) {
                var distance = getDistance(start_path_temp[i], start_path_temp[i + 1]);
                var divideBy = Math.floor(distance / 20);

                var diff = [(start_path_temp[i + 1].B - start_path_temp[i].B) / divideBy, (start_path_temp[i + 1].k - start_path_temp[i].k) / divideBy]
                save_start_path.push(start_path_temp[i])
                for (var j = 0; j < divideBy; j++) {
                    var t = new google.maps.LatLng(start_path_temp[i].k + (diff[1] * j), start_path_temp[i].B + (diff[0] * j))
                    save_start_path.push(t)
                }
                if (i == start_path_temp.length - 2)
                    save_start_path.push(start_path_temp[i + 1])
            }
            $scope.dataRelation[start_min_index].path = save_start_path;
            start_min = 1 / 0;
            for (var i = 0; i < $scope.dataRelation[start_min_index].path.length; i++) {
                var value = calcDistance($scope.dataRelation[start_min_index].path[i], latlng_start)
                if (value <= start_min) {
                    start_min = value
                    start_min_node = i

                }
            }
            end_min = 1 / 0;
            for (var i = 0; i < $scope.dataRelation[end_min_index].path.length; i++) {
                var value = calcDistance($scope.dataRelation[end_min_index].path[i], latlng_end)
                if (value <= end_min) {
                    end_min = value
                    end_min_node = i

                }
            }

            var all_path = [];
            var lower_node = undefined
            var higher_node = undefined
            var result = 0
            if (start_min_node > end_min_node && !$scope.dataRelation[start_min_index].one_way) {
                result = getDistance($scope.dataRelation[start_min_index].path[start_min_node], $scope.dataRelation[start_min_index].path[end_min_node]) / $scope.dataRelation[start_min_index].traffic[0].speed
                lower_node = end_min_node;
                higher_node = start_min_node
            } else if (end_min_node > start_min_node) {
                result = getDistance($scope.dataRelation[start_min_index].path[start_min_node], $scope.dataRelation[start_min_index].path[end_min_node]) / $scope.dataRelation[start_min_index].traffic[1].speed;
                lower_node = start_min_node;
                higher_node = end_min_node;
            } else if (end_min_node == start_min_node) {
                console.log("ROUTE NOT FOUND")
                $scope.dataRelation = backup_dataRelation;
                return
            } else {
                console.log("ROUTE NOT FOUND")
                $scope.dataRelation = backup_dataRelation;
                return
            }
            $scope.polys2 = [{}, {}, {}]
            for (var i = lower_node; i < higher_node; i++) {
                all_path.push($scope.dataRelation[start_min_index].path[i])
            }

            $scope.polys2[0].path = all_path;
            $scope.polys2[1].stroke = {
                color: '#ff00ff',
                weight: 2,
                opacity: 1.0
            }
            $scope.polys2[1].icons = [{
                icon: {
                    path: google.maps.SymbolPath.FORWARD_OPEN_ARROW
                },
                offset: '100px',
                repeat: '200px'
            }]
            $scope.polys2[2].stroke = {
                color: '#ff00ff',
                weight: 2,
                opacity: 1.0
            }
            $scope.polys2[2].icons = [{
                icon: {
                    path: google.maps.SymbolPath.BACKWARD_OPEN_ARROW
                },
                offset: '100px',
                repeat: '200px'
            }]
            if (end_min_node > start_min_node) {
                $scope.polys2[0].stroke = {
                    color: getColorFromTraffic($scope.dataRelation[start_min_index].traffic[0].speed, $scope.dataRelation[start_min_index].traffic[0].count),
                    weight: 2,
                    opacity: 1.0
                }
                $scope.polys2[0].icons = [{
                    icon: {
                        path: google.maps.SymbolPath.FORWARD_OPEN_ARROW
                    },
                    offset: '100px',
                    repeat: '200px'
                }]
                $scope.polys2[1].path = [{
                    latitude: latlng_start.k,
                    longitude: latlng_start.B
                }, all_path[0]]
                $scope.polys2[2].path = [{
                    latitude: latlng_end.k,
                    longitude: latlng_end.B
                }, all_path[all_path.length - 1]]
            } else {
                $scope.polys2[0].stroke = {
                    color: getColorFromTraffic($scope.dataRelation[start_min_index].traffic[1].speed, $scope.dataRelation[start_min_index].traffic[1].count),
                    weight: 2,
                    opacity: 1.0
                }
                $scope.polys2[0].icons = [{
                    icon: {
                        path: google.maps.SymbolPath.BACKWARD_OPEN_ARROW
                    },
                    offset: '100px',
                    repeat: '200px'
                }]
                $scope.polys2[1].path = [{
                    latitude: latlng_start.k,
                    longitude: latlng_start.B
                }, all_path[all_path.length - 1]]
                $scope.polys2[2].path = [{
                    latitude: latlng_end.k,
                    longitude: latlng_end.B
                }, all_path[0]]
            }
            $scope.dataRelation = backup_dataRelation;
            return
        }
        //seperate min path
        var start_path_temp = $scope.dataRelation[start_min_index].path
        var save_start_path = []
        var end_path_temp = $scope.dataRelation[end_min_index].path
        var save_end_path = []
        for (var i = 0; i < start_path_temp.length - 1; i++) {
            var distance = getDistance(start_path_temp[i], start_path_temp[i + 1]);
            var divideBy = Math.floor(distance / 20);

            var diff = [(start_path_temp[i + 1].B - start_path_temp[i].B) / divideBy, (start_path_temp[i + 1].k - start_path_temp[i].k) / divideBy]
            save_start_path.push(start_path_temp[i])
            for (var j = 0; j < divideBy; j++) {
                var t = new google.maps.LatLng(start_path_temp[i].k + (diff[1] * j), start_path_temp[i].B + (diff[0] * j))
                save_start_path.push(t)
            }
            if (i == start_path_temp.length - 2)
                save_start_path.push(start_path_temp[i + 1])
        }
        $scope.dataRelation[start_min_index].path = save_start_path;

        for (var i = 0; i < end_path_temp.length - 1; i++) {
            var distance = getDistance(end_path_temp[i], end_path_temp[i + 1]);
            var divideBy = Math.floor(distance / 20);
            var diff = [(end_path_temp[i + 1].B - end_path_temp[i].B) / divideBy, (end_path_temp[i + 1].k - end_path_temp[i].k) / divideBy]
            save_end_path.push(end_path_temp[i])
            for (var j = 0; j < divideBy; j++) {
                var t = new google.maps.LatLng(end_path_temp[i].k + (diff[1] * j), end_path_temp[i].B + (diff[0] * j))
                save_end_path.push(t)
            }
            if (i == end_path_temp.length - 2)
                save_end_path.push(end_path_temp[i + 1])
        }
        $scope.dataRelation[end_min_index].path = save_end_path;

        start_min = 1 / 0
        for (var i = 0; i < $scope.dataRelation[start_min_index].path.length; i++) {
            var value = calcDistance($scope.dataRelation[start_min_index].path[i], latlng_start)
            if (value <= start_min) {
                start_min = value
                start_min_node = i

            }
        }

        end_min = 1 / 0
        for (var i = 0; i < $scope.dataRelation[end_min_index].path.length; i++) {
            var value = calcDistance($scope.dataRelation[end_min_index].path[i], latlng_end)
            if (value <= end_min) {
                end_min = value
                end_min_node = i

            }
        }
        var start = [0, 0]
        var start_id = [-1, -1]
        var end = [0, 0]
        var end_id = [-1, -1]
        var result = [
            [0, 0],
            [0, 0]
        ]
        var result_node = [
                [0, 0],
                [0, 0]
            ]
            // if one way calc only on start[1] or end[1]
        start[0] = getDistance(new google.maps.LatLng($scope.dataRelation[start_min_index].cameraPoint1.latitude, $scope.dataRelation[start_min_index].cameraPoint1.longitude), $scope.dataRelation[start_min_index].path[start_min_node]);
        start[1] = getDistance(new google.maps.LatLng($scope.dataRelation[start_min_index].cameraPoint2.latitude, $scope.dataRelation[start_min_index].cameraPoint2.longitude), $scope.dataRelation[start_min_index].path[start_min_node]);
        start_id[0] = $scope.dataRelation[start_min_index].cameraPoint1.id
        start_id[1] = $scope.dataRelation[start_min_index].cameraPoint2.id
        end_id[0] = $scope.dataRelation[end_min_index].cameraPoint1.id
        end_id[1] = $scope.dataRelation[end_min_index].cameraPoint2.id
        end[0] = getDistance(new google.maps.LatLng($scope.dataRelation[end_min_index].cameraPoint1.latitude, $scope.dataRelation[end_min_index].cameraPoint1.longitude), $scope.dataRelation[end_min_index].path[end_min_node]);
        end[1] = getDistance(new google.maps.LatLng($scope.dataRelation[end_min_index].cameraPoint2.latitude, $scope.dataRelation[end_min_index].cameraPoint2.longitude), $scope.dataRelation[end_min_index].path[end_min_node]);
        
        if ($scope.dataRelation[start_min_index].one_way)
            start[0] = 1 / 0
        if ($scope.dataRelation[end_min_index].one_way)
            end[1] = 1 / 0
        for (var i = 0; i < start.length; i++) {
            for (var j = 0; j < end.length; j++) {
                //TODO add traffic on start+end
                //if start[0] traffic[0] 
                //if start[1] traffic[1]
                result[i][j] = 0
                if (i == 0) {
                    result[i][j] += (start[i] / $scope.dataRelation[start_min_index].traffic[1].speed)
                } else {
                    result[i][j] += (start[i] / $scope.dataRelation[start_min_index].traffic[0].speed)
                }

                var result_b = result[i][j]
                // console.log('result_before 1', result_b)
                if (j == 0) {
                    result[i][j] += (end[j] / $scope.dataRelation[end_min_index].traffic[0].speed)
                } else {
                    result[i][j] += (end[j] / $scope.dataRelation[end_min_index].traffic[1].speed)
                }
                // console.log('result_before 2', result[i][j] - result_b)
                var route_temp = g.shortestPath(String(start_id[i]), String(end_id[j])).concat([String(start_id[i])]).reverse();
                result_node[i][j] = route_temp;
                var result_all = 0.0;
                for (var k = 0; k < route_temp.length - 1; k++) {
                    result_all += g.getVertices()[route_temp[k]][route_temp[k + 1]];
                }
                // console.log('result_all', result_all);
                result[i][j] += result_all;
                if ((route_temp[0] != String(start_id[0]) && route_temp[0] != String(start_id[1])) || (route_temp[route_temp.length - 1] != String(end_id[0]) && route_temp[route_temp.length - 1] != String(end_id[1]))) {
                    result[i][j] = 1 / 0;
                }
            }
        }
        // console.log('result', result);
        // console.log('result_node', result_node);
        var min_start = -1
        var min_end = -1
        var min_result = 1 / 0;
        //sort and check there is no route or not
        for (var i = 0; i < start.length; i++) {
            for (var j = 0; j < end.length; j++) {
                if (result[i][j] < min_result) {
                    min_result = result[i][j];
                    min_start = i;
                    min_end = j;
                }
            }
        }
        // console.log('Min Weight Result', min_result, i, j);
        var start_path = []
        var end_path = []

        if (min_start == -1) {
            $scope.polys2 = []
            console.log("ROUTE NOT FOUND")
            $scope.dataRelation = backup_dataRelation;
            return
        }
        $scope.polys2 = [{}, {}, {}, {}]
        if (result_node[min_start][min_end][0] == $scope.dataRelation[start_min_index].cameraPoint2.id) {
            for (var i = $scope.dataRelation[start_min_index].path.length - 1; i >= start_min_node; i--) {
                start_path.push($scope.dataRelation[start_min_index].path[i])
            }
            $scope.polys2[0].stroke = {
                color: getColorFromTraffic($scope.dataRelation[start_min_index].traffic[0].speed, $scope.dataRelation[start_min_index].traffic[0].count),
                weight: 2,
                opacity: 1.0
            }
            $scope.polys2[0].icons = [{
                icon: {
                    path: google.maps.SymbolPath.BACKWARD_OPEN_ARROW
                },
                offset: '100px',
                repeat: '200px'
            }]
        } else {
            for (var i = 0; i <= start_min_node; i++) {
                start_path.push($scope.dataRelation[start_min_index].path[i])
            }
            $scope.polys2[0].stroke = {
                color: getColorFromTraffic($scope.dataRelation[start_min_index].traffic[1].speed, $scope.dataRelation[start_min_index].traffic[1].count),
                weight: 2,
                opacity: 1.0
            }
            $scope.polys2[0].icons = [{
                icon: {
                    path: google.maps.SymbolPath.BACKWARD_OPEN_ARROW
                },
                offset: '100px',
                repeat: '200px'
            }]
        }

        if (result_node[min_start][min_end][result_node[min_start][min_end].length - 1] == $scope.dataRelation[end_min_index].cameraPoint2.id) {

            for (var i = $scope.dataRelation[end_min_index].path.length - 1; i >= end_min_node; i--) {
                end_path.push($scope.dataRelation[end_min_index].path[i])
            }
            $scope.polys2[1].stroke = {
                color: getColorFromTraffic($scope.dataRelation[end_min_index].traffic[1].speed, $scope.dataRelation[end_min_index].traffic[1].count),
                weight: 2,
                opacity: 1.0
            }
            $scope.polys2[1].icons = [{
                icon: {
                    path: google.maps.SymbolPath.FORWARD_OPEN_ARROW
                },
                offset: '100px',
                repeat: '200px'
            }]
        } else {
            for (var i = 0; i <= end_min_node; i++) {
                end_path.push($scope.dataRelation[end_min_index].path[i])
            }
            $scope.polys2[1].stroke = {
                color: getColorFromTraffic($scope.dataRelation[end_min_index].traffic[0].speed, $scope.dataRelation[end_min_index].traffic[0].count),
                weight: 2,
                opacity: 1.0
            }
            $scope.polys2[1].icons = [{
                icon: {
                    path: google.maps.SymbolPath.FORWARD_OPEN_ARROW
                },
                offset: '100px',
                repeat: '200px'
            }]
        }
        $scope.polys2[0].path = start_path;
        $scope.polys2[1].path = end_path;

        $scope.polys2[2].stroke = {
            color: '#ff00ff',
            weight: 2,
            opacity: 1.0
        }
        $scope.polys2[2].icons = [{
            icon: {
                path: google.maps.SymbolPath.FORWARD_OPEN_ARROW
            },
            offset: '100px',
            repeat: '200px'
        }]
        $scope.polys2[3].icons = [{
            icon: {
                path: google.maps.SymbolPath.BACKWARD_OPEN_ARROW
            },
            offset: '100px',
            repeat: '200px'
        }]
        $scope.polys2[3].stroke = {
            color: '#ff00ff',
            weight: 2,
            opacity: 1.0
        }
        $scope.polys2[2].path = [{
            latitude: latlng_start.k,
            longitude: latlng_start.B
        }, start_path[start_path.length - 1]]
        $scope.polys2[3].path = [{
            latitude: latlng_end.k,
            longitude: latlng_end.B
        }, end_path[end_path.length - 1]]
        for (var i = 0; i < $scope.dataRelation.length; i++) {
            for (var j = 0; j < result_node[min_start][min_end].length; j++) {
                if ((result_node[min_start][min_end][j] == $scope.dataRelation[i].cameraPoint1.id && result_node[min_start][min_end][j + 1] == $scope.dataRelation[i].cameraPoint2.id)) {
                    $scope.polys2.push({})
                    var index = $scope.polys2.length - 1
                    $scope.polys2[index].path = $scope.dataRelation[i].path
                    $scope.polys2[index].stroke = {
                        color: getColorFromTraffic($scope.dataRelation[i].traffic[0].speed, $scope.dataRelation[end_min_index].traffic[0].count),
                        weight: 2,
                        opacity: 1.0
                    }
                    $scope.polys2[index].icons = [{
                        icon: {
                            path: google.maps.SymbolPath.FORWARD_OPEN_ARROW
                        },
                        offset: '100px',
                        repeat: '200px'
                    }]
                } else if ((result_node[min_start][min_end][j] == $scope.dataRelation[i].cameraPoint2.id && result_node[min_start][min_end][j + 1] == $scope.dataRelation[i].cameraPoint1.id)) {
                    $scope.polys2.push({})
                    var index = $scope.polys2.length - 1
                    $scope.polys2[index].path = $scope.dataRelation[i].path
                    $scope.polys2[index].stroke = {
                        color: getColorFromTraffic($scope.dataRelation[i].traffic[1].speed, $scope.dataRelation[end_min_index].traffic[1].count),
                        weight: 2,
                        opacity: 1.0
                    }
                    $scope.polys2[index].icons = [{
                        icon: {
                            path: google.maps.SymbolPath.BACKWARD_OPEN_ARROW
                        },
                        offset: '100px',
                        repeat: '200px'
                    }]
                }
            }

        }
        $scope.dataRelation = backup_dataRelation;
    }
    $scope.polys = [];

    $scope.duration = 1;
    $scope.render = false;
    $scope.dataRelation = [];
    $scope.alt_dataRelation = [];
    $scope.$watch('datetime', function() {
        console.log('get traffic on update', $scope.datetime)
            //re-render poly line and request traffic from server
        $scope.updateTraffic(0);
        //console.log("datetime change",$scope.datetime)
    }, true);
    $scope.updateTraffic = function(i) {
        if(i == $scope.dataRelation.length){
            $scope.renderPolyline()
            return
        }
        restService.getTrafficFromDataRelation($scope.dataRelation[i].id, $scope.datetime.start, $scope.datetime.end).then(function(response) {
                // console.log('traffic',response.data)
                $scope.dataRelation[i].traffic = response.data.data;
                // console.log($scope.dataRelation)
                
        $scope.updateTraffic(i+1);
            });
    }

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
                    // console.log('in')$
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
                            cameraPoint1:dataRelation[i].cameraPoint1.mapPoint,
                            cameraPoint2:dataRelation[i].cameraPoint2.mapPoint,
                            one_way: dataRelation[i].one_way
                        })
                        // console.log('in')
                }
                // console.log($scope.dataRelation)
                $scope.getLatLngDataFromDataRelation(dataRelation, i + 1, length);
            });
        });
    }
    restService.getDataRelation().then(function(response) {
        var dataRelation = response.data.objects
        var i = 0;
        $scope.getLatLngDataFromDataRelation(dataRelation, i, dataRelation.length);

    });
    var nextId = 0;
    $scope.createSpeedMarker = function(lat, lng, number) {
        var icon = number;
        if(number > 99){
            icon = 99;
        }
        // console.log(number);
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
    $scope.renderPolyline = function() {
        // console.log('render')
        // console.log('dataRelation', $scope.dataRelation)
        // console.log('alt_dataRelation', $scope.alt_dataRelation)
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
            var center = Math.floor(($scope.polys[index].path.length-1)/2)
            $scope.speedMarker.push($scope.createSpeedMarker(($scope.polys[index].path[center].lat()+$scope.polys[index].path[center+1].lat())/2.0, ($scope.polys[index].path[center].lng()+$scope.polys[index].path[center+1].lng())/2.0,
                $scope.dataRelation[i].traffic[0].speed))
            $scope.polys[index].events = events;
            $scope.polys[index].icons = icons;
            $scope.polys[index].icons.id = $scope.polys[index].id
            if ($scope.dataRelation[i].one_way == true) {
                continue;
            }

            if ($scope.alt_dataRelation[i].id != undefined) {
                // console.log($scope.alt_dataRelation)
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
                for (var j = 0; j < path.length; j++) {
                    //calculate from average of all path
                }
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
            $scope.speedMarker.push($scope.createSpeedMarker((($scope.polys[index].path[center].lat()+$scope.polys[index].path[center+1].lat())/2.0 ), (($scope.polys[index].path[center].lng()+$scope.polys[index].path[center+1].lng())/2.0), $scope.dataRelation[i].traffic[1].speed))
            $scope.polys[index].events = events;
            $scope.polys[index].icons = icon2;
            $scope.polys[index].icons.id = $scope.polys[index].id;
        }
        //console.log('polys',$scope.polys);
        // console.log($scope.speedMarker)
        $scope.speedMarker2 = []
        for (var i = 0; i < $scope.speedMarker.length; i++) {
            if ($scope.speedMarker[i].speed != 0) {
                $scope.speedMarker2.push($scope.speedMarker[i]);
                // console.log($scope.speedMarker[i])
            }
        }
    }

    $scope.$watch('dataRelation', function() {
        //console.log("dataRelation change",$scope.dataRelation)
        if ($scope.dataRelation.length == 0)
            return;
        // $scope.renderPolyline();
        //console.log($scope.polys)
    }, true);
    $scope.deletedMarkers = []
    restService.getMap().then(function(response) {
        //$log.info('getMap',response)
        $scope.map = {
            center: {
                latitude: response.data.objects[0].center_lat,
                longitude: response.data.objects[0].center_lng
            },
            zoom: response.data.objects[0].zoom,
            events: {
                click: function(mapModel, eventName, originalEventArgs) {
                    // 'this' is the directive's scope
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
                    //scope apply required because this event handler is outside of the angular domain
                    $scope.$apply();
                }
            }
        }
        $scope.map_id = response.data.objects[0].resource_uri;
    });
    $scope.markers = [];
    restService.getMapPoint().then(function(response) {
        //console.log('getMapPoint',response)
        $scope.markers = response.data.objects;
    });
    //get from databases
    var nextId = -1;
    $scope.save = function() {
        //$log.info('save')
        for (var i = 0; i < $scope.markers.length; i++) {

            var formData = {
                latitude: $scope.markers[i].latitude,
                longitude: $scope.markers[i].longitude,
                map: $scope.map_id
            };
            if ($scope.markers[i].options != undefined) {
                restService.postMapPoint(formData).then(function(response) {
                    //$log.info('sent post resp : '+response);
                });
            } else {
                restService.postMapPointById($scope.markers[i].id, formData).then(function(response) {
                    //$log.info('sent post by id resp : '+response);
                });
            }
        }
        for (var i = 0; i < $scope.deletedMarkers.length; i++) {
            if ($scope.deletedMarkers[i].id > 0) {
                restService.deleteMapPoint($scope.deletedMarkers[i].id).then(function(response) {
                    //console.log('delete marker resp :',response)
                })
            }
        }

    }
    $scope.onMarkerClicked = function(marker) {
        //$log.info('clicked on markers :'+marker)
        marker.showWindow = true;
        $scope.$apply();
    };
    $scope.editTime = function() {
        // console.log("openTime");
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

    $scope.series = [$scope.item.description + ' ขาเข้า', $scope.item.description + ' ขาออก'];
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
        temp1.unshift('ความเร็ว ' + $scope.series[0]);

        var temp2 = $scope.data[1];
        temp2.unshift('ความเร็ว ' + $scope.series[1]);

        var temp3 = $scope.data2[0];
        temp3.unshift('จำนวนยานยนตร์ ' + $scope.series[0]);

        var temp4 = $scope.data2[1];
        temp4.unshift('จำนวนยานยนตร์ ' + $scope.series[1]);

        var temp5 = $scope.labels;
        temp5.unshift("เส้นทาง / วันเวลา");

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