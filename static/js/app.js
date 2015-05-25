var app = angular.module('app', ['uiGmapgoogle-maps', 'ngRoute', 'ui.bootstrap', 'chart.js', 'angularFileUpload', 'ui-rangeSlider']);
//Django + Angular mod
app.config(['$httpProvider', function($httpProvider) {
    // django and angular both support csrf tokens. This tells
    // angular which cookie to add to what header.
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
}])

//This is for page title
app.run(['$location', '$rootScope', function($location, $rootScope) {
    $rootScope.$on('$routeChangeSuccess', function(event, current, previous) {
        $rootScope.title = current.$$route.title;
    });
}]);

//Google Map API config
app.config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyAqfra42hSIN0miW_zmorjqq459iB3ATsw',
        v: '3.17',
        libraries: 'drawing,places,weather,geometry,visualization'
    });
})

//Directive to deal bootstrap datepicker bug
//*** Temp fix for Angular 1.3 support [#2659](https://github.com/angular-ui/bootstrap/issues/2659)
app.directive('datepickerPopup', ['datepickerPopupConfig', 'dateParser', 'dateFilter', function(datepickerPopupConfig, dateParser, dateFilter) {
    return {
        'restrict': 'A',
        'require': '^ngModel',
        'link': function($scope, element, attrs, ngModel) {
            var dateFormat;

            
            attrs.$observe('datepickerPopup', function(value) {
                dateFormat = value || datepickerPopupConfig.datepickerPopup;
                ngModel.$render();
            });

            ngModel.$formatters.push(function(value) {
                return ngModel.$isEmpty(value) ? value : dateFilter(value, dateFormat);
            });
        }
    };
}]);

//filter for datetime 
app.filter('hourMinFilter', function() {
    return function(value) {

        var min = parseInt(value, 10); // don't forget the second param
        var hours = Math.floor(min / 60);
        var minutes = min - (hours * 60);

        if (hours < 10) {
            hours = "0" + hours;
        }
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        var time = hours + ':' + minutes;
        return time;
    };
});
//restService
app.service('restService', function($http, $rootScope, uiGmapGoogleMapApi) {
    return {
        getDirectionObject: function(origin, dest) {


        },
        getCamera: function() {
            var path = '/api/v1/camera/?format=json';
            return $http.get(path);
        },
        postCamera: function(data) {
            var path = '/api/v1/camera/?format=json';
            return $http.post(path, data);
        },
        resumeVideo: function(video_id) {
            var path = '/resume/';
            var data = {
                'id': video_id
            };
            return $http.post(path, data);
        },
        postVideo: function(data) {
            var path = '/api/v1/video/?format=json';
            return $http.post(path, data);
        },
        getVideoByCameraId: function(camera_id) {
            var path = '/api/v1/video/?camera__id=' + camera_id + '&order_by=-added_time&format=json';
            return $http.get(path);
        },
        getMap: function(data) {
            var path = '/api/v1/map/?format=json';
            return $http.get(path);
        },
        getMapPoint: function() {
            var path = '/api/v1/mapPoint/?format=json';
            return $http.get(path);
        },
        postMapPoint: function(data) {
            var path = '/api/v1/mapPoint/?format=json';
            return $http.post(path, data)
        },
        deleteMapPoint: function(id) {
            var path = '/api/v1/mapPoint/' + id + '/?format=json';
            return $http.delete(path);
        },
        postMapPointById: function(id, data) {
            var path = '/api/v1/mapPoint/' + id + '/?format=json';
            return $http.put(path, data)
        },
        postCameraPoint: function(data) {
            var path = '/api/v1/cameraPoint/?format=json';
            return $http.post(path, data)
        },
        postCameraPointById: function(id, data) {
            var path = '/api/v1/cameraPoint/' + id + '/?format=json';
            return $http.put(path, data)
        },
        postDataRelation: function(data) {
            var path = '/api/v1/dataRelation/?format=json';
            return $http.post(path, data)
        },
        getDataRelationByCameraId: function(id) {
            var path = '/api/v1/dataRelation/?camera__id=' + id + '&format=json';
            return $http.get(path);
        },
        getDataRelation: function() {
            var path = '/api/v1/dataRelation/?format=json'
            return $http.get(path);
        },
        getDataByUri: function(uri) {
            var path = uri + '?format=json'
            return $http.get(path);
        },
        putDataByUri: function(uri, data) {
            var path = uri + '?format=json'
            return $http.put(path, data);
        },
        getTrafficFromDataRelation: function(id, start, end) {
            var path = '/traffic/?id=' + id + '&start=' + start.toISOString() + '&end=' + end.toISOString();
            return $http.get(path);
        },
        postVideo: function(data) {
            var path = '/upload/'
            return $http.post(path, data);
        },
        postStream: function(data) {
            var path = '/stream/'
            return $http.post(path, data);
        },
        getState: function(id) {
            var path = '/state/?task_id=' + id
            return $http.get(path);
        }

    }
})


//MainController
//for the future use
app.controller('MainCtrl', function(restService, $scope, $http, $modal, $log, uiGmapGoogleMapApi) {
    //Main Ctrl 
    //Still Empty
});

//SettingController
//Author Kunat Pipatanakul
app.controller('MapSettingController', function(restService, $scope, $http, $modal, $log, uiGmapGoogleMapApi, $location, $timeout, $window) {
    $scope.render = false
    $scope.polys = [];
    $scope.dataRelation = [];
    $scope.deletedMarkers = []
    
    $scope.markers = [];

    var nextId = -1;




    $scope.getLatLngDataFromDataRelation = function(dataRelation, i, length) {
        if (i == length) {
            $scope.render = true;
            return;
        }
        uiGmapGoogleMapApi.then(function() {
            if (dataRelation[i].path != "") {
                var _path = JSON.parse(dataRelation[i].path).path;
                var path = [];
                for (var j = 0; j < _path.length; j++) {
                    path.push(new google.maps.LatLng(_path[j].k, _path[j].B))
                }
                $scope.dataRelation.push({
                    id: dataRelation[i].id,
                    path: path,
                    icons: [{
                        icon: {
                            path: google.maps.SymbolPath.FORWARD_OPEN_ARROW
                        },
                        offset: '100px',
                        repeat: '200px'
                    }]
                })
            }
            if (dataRelation[i].alt_path != "") {
                var _path = JSON.parse(dataRelation[i].alt_path).path;
                var path = [];
                for (var j = 0; j < _path.length; j++) {
                    path.push(new google.maps.LatLng(_path[j].k, _path[j].B))
                }
                $scope.dataRelation.push({
                    id: dataRelation[i].id,
                    path: path,
                    icons: [{
                        icon: {
                            path: google.maps.SymbolPath.FORWARD_OPEN_ARROW
                        },
                        offset: '100px',
                        repeat: '200px'
                    }]
                });
            } else {
                if (!dataRelation[i].one_way && dataRelation[i].path != "") {

                    var _path = JSON.parse(dataRelation[i].path).path;
                    var path = [];
                    for (var j = 0; j < _path.length; j++) {
                        path.push(new google.maps.LatLng(_path[j].k, _path[j].B))
                    }
                    $scope.dataRelation.push({
                        id: dataRelation[i].id,
                        path: path,
                        icons: [{
                            icon: {
                                path: google.maps.SymbolPath.BACKWARD_OPEN_ARROW
                            },
                            offset: '100px',
                            repeat: '200px'
                        }]


                    });
                }
            }
            $scope.getLatLngDataFromDataRelation(dataRelation, i + 1, length);
        });
    }

    restService.getDataRelation().then(function(response) {
        var dataRelation = response.data.objects
        var i = 0;
        $scope.getLatLngDataFromDataRelation(dataRelation, i, dataRelation.length);

    });
    $scope.$watch('dataRelation', function() {

        for (var i = 0; i < $scope.dataRelation.length; i++) {
            $scope.polys[i] = $scope.dataRelation[i]
            $scope.polys[i].stroke = {
                color: '#000',
                weight: 1.5,
                opacity: 1.0
            }

            $scope.polys[i].events = {
                click: function(mapModel, eventName, originalEventArgs) {
                    //can't click

                }
            }
        }
    }, true);
    
    restService.getMap().then(function(response) {
        //$log.info('getMap',response)
        $scope.map_id = response.data.objects[0].resource_uri;
        $scope.map = {
            center: {
                latitude: response.data.objects[0].center_lat,
                longitude: response.data.objects[0].center_lng
            },
            zoom: response.data.objects[0].zoom,
            events: {
                click: function(mapModel, eventName, originalEventArgs) {
                    var window_e = window.event;
                    var e = originalEventArgs[0];
                    var lat = e.latLng.lat(),
                        lon = e.latLng.lng();
                    if (window_e.shiftKey) {
                        $scope.markers.push({
                            id: nextId + 1,
                            options: {
                                draggable: true,
                            },
                            icon: '/static/img/blue-dot.png',
                            latitude: lat,
                            longitude: lon
                        });
                        //scope apply required because this event handler is outside of the angular domain
                        $scope.$apply();
                    } else {
                        $scope.markers.push({
                            id: nextId,
                            options: {
                                draggable: true,
                            },
                            icon: '/static/img/red-dot.png',
                            latitude: lat,
                            longitude: lon
                        });
                        nextId -= 1;
                        //scope apply required because this event handler is outside of the angular domain
                        $scope.$apply();
                    }

                }
            }
        };
    });
    restService.getMapPoint().then(function(response) {
        for (var i = 0; i < response.data.objects.length; i++) {
            $scope.markers.push({
                latitude: response.data.objects[i].latitude,
                longitude: response.data.objects[i].longitude,
                icon: '/static/img/red-dot.png',
                id: response.data.objects[i].id
            })

            if (response.data.objects[i].alt_latitude != null) {
                $scope.markers.push({
                    latitude: response.data.objects[i].alt_latitude,
                    longitude: response.data.objects[i].alt_longitude,
                    icon: '/static/img/blue-dot.png',
                    id: response.data.objects[i].id
                })

            }
        }
    });

    $scope.sendMarker = function(i, markers) {
        if (i == markers.length) {
            // $window.location.reload();
            return;
        }
        if (i < markers.length - 1 && markers[i].id == markers[i + 1].id) {
            var formData = {
                latitude: markers[i].latitude,
                longitude: markers[i].longitude,
                map: $scope.map_id,
                alt_latitude: markers[i + 1].latitude,
                alt_longitude: markers[i + 1].longitude
            }
            i += 1;
        } else {
            var formData = {
                latitude: markers[i].latitude,
                longitude: markers[i].longitude,
                map: $scope.map_id
            };
        }
        if (markers[i].options != undefined) {
            restService.postMapPoint(formData).then(function(response) {

                markers[i].id = response.data.id
                //console.log('sent post resp : ',response);
            });
        } else {
            restService.postMapPointById(markers[i].id, formData).then(function(response) {
                //console.log('sent post by id resp : ',response);
            });
        }
        $scope.sendMarker(i + 1, markers);
    }
    $scope.save = function() {

        for (var i = 0; i < $scope.deletedMarkers.length; i++) {
            if ($scope.deletedMarkers[i].id > 0) {
                restService.deleteMapPoint($scope.deletedMarkers[i].id).then(function(response) {
                    //console.log('delete marker resp :',response)
                })
            }
        }

        $scope.deletedMarkers = [];


        $scope.sendMarker(0, $scope.markers);
    }

    $scope.removeMarker = function(marker) {
        $scope.deletedMarkers.push(marker);
        removeFromArray($scope.markers, marker);

    }
    $scope.onMarkerClicked = function(marker) {
        //$log.info('clicked on markers :'+marker)
        marker.showWindow = true;
        $scope.$apply();
    };
    $scope.openCamera = function() {
        var modalInstance = $modal.open({
            templateUrl: '/static/html/modal_camera.html',
            controller: 'ModalCameraCtrl',
            size: 'lg'
        });
    }
    $scope.open = function() {
        var modalInstance = $modal.open({
            templateUrl: '/static/html/modal_setting.html',
            controller: 'ModalSettingCtrl',
            size: 'lg'
        });

        modalInstance.result.then(function(selectedItem) {}, function() {
            //$log.info('Modal dismissed at: ' + new Date());
        });
    };
});

//CameraController
//Author Kunat Pipatanakul
app.controller('ModalCameraCtrl', function(restService, $scope, $modalInstance, $upload, $timeout) {
    $scope.camera = []
    $scope.cameraFormData = {};
    restService.getCamera().then(function(response) {
        $scope.camera = response.data.objects
            //console.log($scope.camera)
        $scope.getTrackingStatus(0);
    });
    $scope.getTrackingStatus = function(i) {
        if (i == $scope.camera.length)
            return
        restService.getVideoByCameraId($scope.camera[i].id).then(function(response) {
            if (response.data.objects.length > 0 && (response.data.objects[0].type == 2 || response.data.objects[0].type == 3)) {
                if (response.data.objects[0].type == 3) {
                    $scope.camera[i].video_url = response.data.objects[0].url
                }
                $scope.camera[i].resume = response.data.objects[0].id
            }
            if (response.data.objects.length > 0 && response.data.objects[0].type == 1 && response.data.objects[0].tracking_id != null) {

                $scope.poll($scope.camera[i], response.data.objects[0].tracking_id);
            }
            if (response.data.objects.length > 0 && response.data.objects[0].type == 0 && response.data.objects[0].tracking_id != null) {
                $scope.camera[i].video_url = response.data.objects[0].url
                $scope.poll($scope.camera[i], response.data.objects[0].tracking_id);
            }
            $scope.getTrackingStatus(i + 1)
        })
    }
    $scope.formComplete = function() {
        if ($scope.cameraFormData.height && $scope.cameraFormData.width && $scope.cameraFormData.name && $scope.addCamera.$valid)
            return true
        return false
    }
    $scope.fileChange = function(file, event, formData) {

        $scope.upload(formData, file);
    }
    $scope.resume = function(camera) {
        restService.resumeVideo(camera.resume).then(function(response) {
            camera.resume = undefined
            $scope.poll(camera, response.data['job_id'])
        });
    }
    $scope.ok = function() {
        $modalInstance.close()
    }
    $scope.save = function(c) {
        var data = {
            'id': c.id,
            'url': c.video_url
        };
        restService.postStream(data).then(function(response) {
            console.log(response)
            $scope.poll(c, response.data['job_id'])
        });
    }
    $scope.add = function() {
        restService.postCamera($scope.cameraFormData).then(function(response) {
            //console.log(response);
            $scope.camera.push(response.data)
            $scope.cameraFormData = {}
        });
    }
    $scope.poll = function(formData, id) {
        $timeout(function() {
            restService.getState(id).then(function(response) {
                //console.log(response)
                formData.progressPercentage = response.data.task;
                formData.status = response.data.status;
                if (response.data.status == 'FAILURE' || response.data.status == 'SUCCESS') {
                    return
                } else {
                    $scope.poll(formData, id);
                }

            })

        }, 5000);
    }
    $scope.upload = function(formData, files) {
        if (files && files.length) {
            var file = files[0];
            $upload.upload({
                url: '/upload/',
                file: file,
                fields: {
                    'id': formData.id,
                    'datetime': formData.video_date.toISOString()
                }
            }).progress(function(evt) {
                formData.progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            }).success(function(data, status, headers, config) {
                $scope.poll(formData, data['job_id'])

            });

        }
    };
});


//SettingController
//Author Kunat Pipatanakul
app.controller('ModalSettingCtrl', function(restService, $scope, $modalInstance, $location, $route, $window, $timeout) {
    $scope.draggable = true;
    $scope.selected_camera = {};
    $scope.draggable_item = [{
        color: 'red',
        left: 0.45,
        top: 0,
        height: 0.1,
        width: 0.1
    }, {
        color: 'blue',
        left: 0.45,
        top: 0.9,
        height: 0.1,
        width: 0.1
    }];
    restService.getCamera().then(function(response) {
        $scope.camera = response.data.objects;

    });
    $scope.marker1 = {};
    $scope.marker2 = {};
    $scope.formData = {
        camera_length: '',
        map_length: '',
        one_way: false
    }
    restService.getMapPoint().then(function(response) {
        $scope.markers = response.data.objects;
    });
    $scope.formComplete = function() {
        if ($scope.dataRelationSetting.$valid)
            return true
        return false
    }
    $scope.$watch('selected_camera', function() {
            if ($scope.selected_camera.id == undefined)
                return
            restService.getDataRelationByCameraId($scope.selected_camera.id).then(function(response) {
                if (response.data.objects.length == 0) {
                    $scope.draggable_item = [{
                        color: 'red',
                        left: 0.45,
                        top: 0,
                        height: 0.1,
                        width: 0.1
                    }, {
                        color: 'blue',
                        left: 0.45,
                        top: 0.9,
                        height: 0.1,
                        width: 0.1
                    }];
                    $scope.formData = {};
                    $scope.marker1 = {};
                    $scope.marker2 = {};
                    return
                }

                restService.getDataByUri(response.data.objects[0].cameraPoint1.resource_uri).then(function(response) {
                    $scope.draggable_item[0] = response.data;
                    $scope.draggable_item[0].color = 'red'
                    for (var i = 0; i < $scope.markers.length; i++) {
                        if ($scope.markers[i].resource_uri == response.data.mapPoint.resource_uri) {
                            $scope.marker1 = $scope.markers[i];
                        }
                    }
                })
                restService.getDataByUri(response.data.objects[0].cameraPoint2.resource_uri).then(function(response) {
                    $scope.draggable_item[1] = response.data;
                    $scope.draggable_item[1].color = 'blue'
                    for (var i = 0; i < $scope.markers.length; i++) {
                        if ($scope.markers[i].resource_uri == response.data.mapPoint.resource_uri) {
                            $scope.marker2 = $scope.markers[i];
                        }
                    }

                })
                $scope.formData = response.data.objects[0];
            });
        })
    //set camera position and param
    $scope.getCameraImg = function() {
        if ($scope.selected_camera == undefined) {
            return '';
        } else {
            return {
                'background-image': 'url(' + $scope.selected_camera.url + ')',
                'width': $scope.selected_camera.width + 'px',
                'height': $scope.selected_camera.height + 'px'
            }
        }
    }
    //save to db
    $scope.ok = function() {
        var element = angular.element("#draggable-zone1");
        var element2 = angular.element("#draggable-zone2");

        var cameraPoint1 = {
            mapPoint: $scope.marker1.resource_uri,
            top: convertToPercent(pInt(element.css('top')), $scope.selected_camera.height),
            left: convertToPercent(pInt(element.css('left')), $scope.selected_camera.width),
            height: convertToPercent(pInt(element.css('height')), $scope.selected_camera.height),
            width: convertToPercent(pInt(element.css('width')), $scope.selected_camera.width)
        };

        if ($scope.formData.one_way == true) {
            var cameraPoint2 = {
                mapPoint: $scope.marker2.resource_uri,
                top: 0,
                left: 0,
                height: 0,
                width: 0
            }
        } else {
            var cameraPoint2 = {
                mapPoint: $scope.marker2.resource_uri,
                top: (convertToPercent(pInt(element2.css('top')), $scope.selected_camera.height)),
                left: (convertToPercent(pInt(element2.css('left')), $scope.selected_camera.width)),
                height: convertToPercent(pInt(element2.css('height')), $scope.selected_camera.height),
                width: convertToPercent(pInt(element2.css('width')), $scope.selected_camera.width)
            }
        }
        if ($scope.draggable_item[0].resource_uri != undefined) {
            restService.putDataByUri($scope.draggable_item[0].resource_uri, cameraPoint1).then(function(response) {
                var cameraPoint1 = response.data.mapPoint;
                $scope.formData.cameraPoint1 = response.data.resource_uri;
                restService.putDataByUri($scope.draggable_item[1].resource_uri, cameraPoint2).then(function(response) {
                    var cameraPoint2 = response.data.mapPoint;
                    $scope.formData.cameraPoint2 = response.data.resource_uri;
                    $scope.formData.camera = $scope.selected_camera.resource_uri;
                    var request = {
                        origin: new google.maps.LatLng(cameraPoint1.latitude, cameraPoint1.longitude),
                        destination: new google.maps.LatLng(cameraPoint2.latitude, cameraPoint2.longitude),
                        travelMode: google.maps.DirectionsTravelMode.WALKING
                    };
                    directionsService = new google.maps.DirectionsService();
                    directionsService.route(request, function(response, status) {
                        if (cameraPoint1.alt_latitude != undefined && cameraPoint2.alt_latitude != undefined) {
                            var request2 = {
                                origin: new google.maps.LatLng(cameraPoint2.alt_latitude, cameraPoint2.alt_longitude),
                                destination: new google.maps.LatLng(cameraPoint1.alt_latitude, cameraPoint1.alt_longitude),
                                travelMode: google.maps.DirectionsTravelMode.WALKING
                            };
                            directionsService.route(request2, function(response2, status) {
                                for(var i = 0 ; i < response.routes[0].overview_path.length ; i++){
                                    response.routes[0].overview_path[i].B = response.routes[0].overview_path[i].lng()
                                    response.routes[0].overview_path[i].k = response.routes[0].overview_path[i].lat()
                                }
                                for(var i = 0 ; i < response2.routes[1].overview_path.length ; i++){
                                    response2.routes[0].overview_path[i].B = response2.routes[0].overview_path[i].lng()
                                    response2.routes[0].overview_path[i].k = response2.routes[0].overview_path[i].lat() 
                                }
                                $scope.formData.path = JSON.stringify({
                                    path: response.routes[0].overview_path,
                                    distance: response.routes[0].legs[0].distance,
                                    summary: response.routes[0].summary
                                });

                                $scope.formData.alt_path = JSON.stringify({
                                    path: response2.routes[0].overview_path,
                                    distance: response2.routes[0].legs[0].distance,
                                    summary: response2.routes[0].summary
                                });

                                //put path to db
                                restService.putDataByUri($scope.formData.resource_uri, $scope.formData).then(function(response) {
                                    // console.log(response)

                                })
                            });
                        } else {
                            for(var i = 0 ; i < response.routes[0].overview_path.length ; i++){
                                response.routes[0].overview_path[i].B = response.routes[0].overview_path[i].lng()
                                response.routes[0].overview_path[i].k = response.routes[0].overview_path[i].lat()
                            }
                            //put path to db
                            $scope.formData.path = JSON.stringify({
                                path: response.routes[0].overview_path,
                                distance: response.routes[0].legs[0].distance,
                                summary: response.routes[0].summary
                            });
                            restService.putDataByUri($scope.formData.resource_uri, $scope.formData).then(function(response) {
                                // console.log(response)
                            })
                        };

                    });



                    //console.log('$scope.formData',$scope.formData);

                });
            });
        } else {
            restService.postCameraPoint(cameraPoint1).then(function(response) {
                var cameraPoint1 = response.data;
                $scope.formData.cameraPoint1 = cameraPoint1.resource_uri;
                restService.postCameraPoint(cameraPoint2).then(function(response) {
                    var cameraPoint2 = response.data;
                    $scope.formData.cameraPoint2 = cameraPoint2.resource_uri;
                    $scope.formData.camera = $scope.selected_camera.resource_uri;
                    var request = {
                        origin: new google.maps.LatLng(cameraPoint1.mapPoint.latitude, cameraPoint1.mapPoint.longitude),
                        destination: new google.maps.LatLng(cameraPoint2.mapPoint.latitude, cameraPoint2.mapPoint.longitude),
                        travelMode: google.maps.DirectionsTravelMode.WALKING
                    };
                    directionsService = new google.maps.DirectionsService();
                    directionsService.route(request, function(response, status) {
                        if (cameraPoint1.mapPoint.alt_latitude != undefined && cameraPoint2.mapPoint.alt_latitude != undefined) {
                            var request2 = {
                                origin: new google.maps.LatLng(cameraPoint2.mapPoint.alt_latitude, cameraPoint2.mapPoint.alt_longitude),
                                destination: new google.maps.LatLng(cameraPoint1.mapPoint.alt_latitude, cameraPoint1.mapPoint.alt_longitude),
                                travelMode: google.maps.DirectionsTravelMode.WALKING
                            };
                            directionsService.route(request2, function(response2, status2) {
                                if (status != "OK" || status2 != "OK") {
                                }
                                $scope.formData.path = JSON.stringify({
                                    path: response.routes[0].overview_path,
                                    distance: response.routes[0].legs[0].distance,
                                    summary: response.routes[0].summary
                                });

                                $scope.formData.alt_path = JSON.stringify({
                                    path: response2.routes[0].overview_path,
                                    distance: response2.routes[0].legs[0].distance,
                                    summary: response2.routes[0].summary
                                });

                                //put path to db
                                restService.postDataRelation($scope.formData).then(function(response) {
                                    // console.log(response)
                                })
                            });
                        } else {
                            if (status != "OK") {
                                //TODO show error
                                console.log("SomeError is occured in google direction api.")
                            }
                            $scope.formData.path = JSON.stringify({
                                path: response.routes[0].overview_path,
                                distance: response.routes[0].legs[0].distance,
                                summary: response.routes[0].summary
                            });
                            restService.postDataRelation($scope.formData).then(function(response) {
                                // console.log(response)
                            })
                        };

                    });
                });
            });
        }

        $modalInstance.close();
        $timeout(function() {

            $window.location.reload();
        }, 500)
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
    $scope.getStyle = function(item_no) {
        //console.log('getStyled')
        var item = $scope.draggable_item[item_no]

        var height = $scope.selected_camera.height;
        var width = $scope.selected_camera.width;
        $("#draggable-zone1").draggable({
            containment: "#camera-wrapper",
            scroll: false
        }).resizable()
        $("#draggable-zone2").draggable({
            containment: "#camera-wrapper",
            scroll: false
        }).resizable()

        if (item_no == 0) {
            return {
                'background-color': item.color,
                'left': item.left * width + 'px',
                'top': item.top * height + 'px',
                'width': item.width * width + 'px',
                'height': item.height * height + 'px'
            }
        } else {
            var item1 = $scope.draggable_item[0]
            return {
                'background-color': item.color,
                'left': item.left * width + 'px',
                'top': item.top * height + 'px',
                'width': item.width * width + 'px',
                'height': item.height * height + 'px'
            }
        }
    }
});
