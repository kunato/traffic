
Array.prototype.remove = function(val) {
    var i = this.indexOf(val);
         return i>-1 ? this.splice(i, 1) : [];
  };
var app = angular.module('app', ['uiGmapgoogle-maps','ngRoute','ui.bootstrap','chart.js']);
app.config(['$httpProvider', function($httpProvider){
        // django and angular both support csrf tokens. This tells
        // angular which cookie to add to what header.
        $httpProvider.defaults.xsrfCookieName = 'csrftoken';
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
}])
app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/report', {
        templateUrl: '/static/html/report.html',
        controller: 'ReportController'
      }).
      when('/setting', {
        templateUrl: '/static/html/setting.html',
        controller: 'MapSettingController'
      }).
      when('/',{
        redirectTo: "/setting"
      })
  }]);
app.config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyAqfra42hSIN0miW_zmorjqq459iB3ATsw',
        v: '3.17',
        libraries: 'drawing,places,weather,geometry,visualization'
    });
})
app.service('restService', function($http, $rootScope,uiGmapGoogleMapApi) {
  return {
    getDirectionObject: function(origin,dest){
      
      
    },
    getCamera: function() {
      var path = '/api/v1/camera/?format=json';
      return $http.get(path);
    },
    postCamera: function(data){
      var path = '/api/v1/camera/?format=json';
      return $http.post(path,data);
    },
    postVideo: function(data){
      var path = '/api/v1/video/?format=json';
      return $http.post(path,data)
    },

    getMap: function(data){
      var path = '/api/v1/map/?format=json';
      return $http.get(path);
    },
    getMapPoint: function(){
      var path = '/api/v1/mapPoint/?format=json';
      return $http.get(path);
    },
    postMapPoint: function(data){
      var path = '/api/v1/mapPoint/?format=json';
      return $http.post(path,data)
    },
    deleteMapPoint: function(id){
      var path = '/api/v1/mapPoint/'+id+'/?format=json';
      return $http.delete(path);
    },
    postMapPointById: function(id,data){
      var path = '/api/v1/mapPoint/'+id+'/?format=json';
      return $http.put(path,data)
    },
    postCameraPoint: function(data){
      var path = '/api/v1/cameraPoint/?format=json';
      return $http.post(path,data)
    },
    postCameraPointById: function(id,data){
      var path = '/api/v1/cameraPoint/'+id+'/?format=json';
      return $http.put(path,data)
    },
    postDataRelation: function(data){
      var path = '/api/v1/dataRelation/?format=json';
      return $http.post(path,data)
    },
    getDataRelationByCameraId: function(id){
      var path = '/api/v1/dataRelation/?camera__id='+id+'&format=json';
      return $http.get(path);
    },
    getDataRelation: function(){
      var path = '/api/v1/dataRelation/?format=json'
      return $http.get(path);
    },
    getDataByUri: function(uri){
      var path = uri+'?format=json'
      return $http.get(path);
    },
    putDataByUri: function(uri,data){
      var path = uri+'?format=json'
      return $http.put(path,data);
    },
    getTrafficFromDataRelation: function(id,time,duration){
      var path = '/traffic/?id='+id+'&time='+time+'&duration='+duration;
      return $http.get(path); 
    }

  }
})
    
var loaded = false;
var data;
function getRandomColor() {
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++ ) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
function convertToPercent(value,max){
  return value/max;
}
function pInt(value){
  if(value.indexOf('px') > -1){
    var i = value.split('px')
  }
  else{
    var i = value;
  }
  return i[0];
}
app.controller('MapSettingController', function(restService, $scope , $http , $modal , $log, uiGmapGoogleMapApi) {
  $scope.polys = [];
  $scope.dataRelation = [];
  // restService.getMap().then(function(response){
  //   $scope.map = response.data.objects[0]
  //   restService.getMapPoint().then(function(response){
  //     console.log(response)
  //     $scope.points = response.data.objects;

  //     console.log('points',$scope.points);
  //   });
  // });

  $scope.getLatLngDataFromDataRelation = function(dataRelation,i,length){
    if(i == length){
      return;
    }
      restService.getDataByUri(dataRelation[i].cameraPoint1).then(function(response){
        var cameraPoint1 = response.data.mapPoint;
        console.log('cameraPoint1',response.data)
        restService.getDataByUri(dataRelation[i].cameraPoint2).then(function(response2){
          var cameraPoint2 = response2.data.mapPoint;
          console.log('cameraPoint2',response2.data)
          uiGmapGoogleMapApi.then(function(){
          var request = {
            origin: new google.maps.LatLng(cameraPoint1.latitude,cameraPoint1.longitude),
            destination: new google.maps.LatLng(cameraPoint2.latitude,cameraPoint2.longitude),
            travelMode: google.maps.DirectionsTravelMode.WALKING
          };
          console.log('sent directionsService with', request);
          directionsService = new google.maps.DirectionsService(),
          directionsService.route(request, function (response, status) {
            $scope.dataRelation.push({id:dataRelation[i].id,path:response.routes[0].overview_path})
            console.log('direction',response);
            $scope.getLatLngDataFromDataRelation(dataRelation,i+1,length)
          });
      });

        });
      });
  }
  restService.getDataRelation().then(function(response){
    console.log('data',response.data.objects)
    var dataRelation = response.data.objects
    var i = 0;
    $scope.getLatLngDataFromDataRelation(dataRelation,i,dataRelation.length);
    
  });
  $scope.$watch('dataRelation',function(){
    console.log("dataRelation change",$scope.dataRelation)
    if($scope.dataRelation.length == $scope.polys.length)
      return
    for (var i = 0 ; i < $scope.dataRelation.length ;i++){
        $scope.polys[i] = $scope.dataRelation[i]

        $scope.polys[i].stroke = {color:getRandomColor(),width:1,opacity:1.0}
        $scope.polys[i].events = {
          click: function (mapModel, eventName, originalEventArgs) {
          // 'this' is the directive's scope
          $log.info("user defined event: " + eventName, mapModel, originalEventArgs);

        }
  }
    }
    console.log($scope.polys)
  },true);
  $scope.$watch('polys',function(){
    console.log('polys change');
  },true);
  // $scope.polylineRenderer = function(path){
  //   var out = [];
  //   for(var i = 0 ; i < path.length ; i++){
  //     out[i] = {latitude:path[i].B,longitude:path[i].k}
  //   }
  //   return out;
  // }
  $scope.test = function(){
    console.log("test",$scope.dataRelation)
    for (var i = 0 ; i < $scope.dataRelation.length ;i++){
        $scope.polys[i] = $scope.dataRelation[i]
    }
  }
  $scope.deletedMarkers = []
  restService.getMap().then(function(response){
    $log.info('getMap',response)
    $scope.map_id = response.data.objects[0].resource_uri;
  });
  $scope.markers = [];
  restService.getMapPoint().then(function(response){
    console.log('getMapPoint',response)
    $scope.markers = response.data.objects;
  });
  //get from databases
  var nextId = -1;
  $scope.map = { center: { latitude: 13.8468, longitude: 100.5680 }, zoom: 17 ,
  events: {
    click: function (mapModel, eventName, originalEventArgs) {
          // 'this' is the directive's scope
          $log.info("user defined event: " + eventName, mapModel, originalEventArgs);
          console.log($scope.markers);
          var e = originalEventArgs[0];
          var lat = e.latLng.lat(),lon = e.latLng.lng();
          $scope.markers.push({
            id: nextId,
            options: {
              draggable:true,
            },
            latitude: lat,
            longitude: lon
          });
          nextId-=1;
          //scope apply required because this event handler is outside of the angular domain
          $scope.$apply();
        }
  }
  };
  $scope.save = function(){
    $log.info('save')
    for(var i = 0 ; i < $scope.markers.length ; i++){
      
      var formData = {latitude:$scope.markers[i].latitude,longitude:$scope.markers[i].longitude,map:$scope.map_id};
      if($scope.markers[i].options != undefined){
        restService.postMapPoint(formData).then(function(response){
          $log.info('sent post resp : '+response);
        });
      }
      else{
        restService.postMapPointById($scope.markers[i].id,formData).then(function(response){
          $log.info('sent post by id resp : '+response);
        });
      }
    }
    for(var i = 0 ; i < $scope.deletedMarkers.length ; i++){
      if($scope.deletedMarkers[i].id > 0){
        restService.deleteMapPoint($scope.deletedMarkers[i].id).then(function(response){
          console.log('delete marker resp :',response)
        })
      }
    }

  }

  $scope.removeMarker = function (marker){
    console.log("Marker remove clicked :",marker);
    $scope.deletedMarkers.push(marker);
    $scope.markers.remove(marker);
    console.log($scope.deletedMarkers);

  }
  $scope.onMarkerClicked = function (marker) {
    $log.info('clicked on markers :'+marker)
    marker.showWindow = true;
    $scope.$apply();
  };
  $scope.open = function () {
    var modalInstance = $modal.open({
      templateUrl: '/static/html/modal_setting.html',
      controller: 'ModalCameraCtrl',
      size:'lg'
    });

    // modalInstance.result.then(function (selectedItem) {
    //   $scope.selected = selectedItem;
    // }, function () {
    //   $log.info('Modal dismissed at: ' + new Date());
    // });
  };
});

app.controller('ModalCameraCtrl', function (restService, $scope, $modalInstance) {
  $scope.draggable = true;
  $scope.selected_camera = {};
  $scope.draggable_item = [{color:'red',left:0.45,top:0,height:0.1,width:0.1},{color:'blue',left:0.45,top:0.9,height:0.1,width:0.1}];
  restService.getCamera().then(function(response){
    $scope.camera = response.data.objects;
    
  });
  $scope.marker1 = {};
  $scope.marker2 = {};
  $scope.formData = {camera_length:'',map_length:'',one_way:false}
  restService.getMapPoint().then(function(response){
    $scope.markers = response.data.objects;
  });
  $scope.$watch('selected_camera',function(){
    console.log('selected_camera',$scope.selected_camera)
    if($scope.selected_camera.id == undefined)
      return
    restService.getDataRelationByCameraId($scope.selected_camera.id).then(function(response){
      console.log('getDataRelationByCameraId : '+$scope.selected_camera.id,response)
      if(response.data.objects.length == 0){
        $scope.draggable_item = [{color:'red',left:0.45,top:0,height:0.1,width:0.1},{color:'blue',left:0.45,top:0.9,height:0.1,width:0.1}];
        $scope.formData = {};
        $scope.marker1 = {};
        $scope.marker2 = {};
        return
      }
      restService.getDataByUri(response.data.objects[0].cameraPoint1).then(function(response){
        console.log('getDataByUri cameraPoint1',response)
        $scope.draggable_item[0] = response.data;
        $scope.draggable_item[0].color = 'red'
        for(var i = 0 ; i < $scope.markers.length ; i++){
          if($scope.markers[i].resource_uri == response.data.mapPoint.resource_uri){
            $scope.marker1 = $scope.markers[i];
          }
        }
        console.log('$scope.marker1',$scope.marker1);
        
      })
      restService.getDataByUri(response.data.objects[0].cameraPoint2).then(function(response){
        console.log('getDataByUri cameraPoint2',response)
        $scope.draggable_item[1] = response.data;
        $scope.draggable_item[1].color = 'blue'
        for(var i = 0 ; i < $scope.markers.length ; i++){
          if($scope.markers[i].resource_uri == response.data.mapPoint.resource_uri){
            $scope.marker2 = $scope.markers[i];
          }
        }
        
      })
      $scope.formData = response.data.objects[0];
    });
  })
  //set camera position and param
  $scope.getCameraImg = function(){
    if($scope.selected_camera == undefined ){
      return '';
    }
    else{
      return {'background-image':'url(' + $scope.selected_camera.url + ')',
      'width':$scope.selected_camera.width+'px',
      'height':$scope.selected_camera.height+'px'
    }
  }
}
$scope.ok = function () {
  var element = angular.element("#draggable-zone1");
  var element2 = angular.element("#draggable-zone2");

  var cameraPoint1 = {
  mapPoint:$scope.marker1.resource_uri,
  top:convertToPercent(pInt(element.css('top')),$scope.selected_camera.height),
  left:convertToPercent(pInt(element.css('left')),$scope.selected_camera.width),
  height:convertToPercent(pInt(element.css('height')),$scope.selected_camera.height),
  width:convertToPercent(pInt(element.css('width')),$scope.selected_camera.width)
  };
   
  if($scope.formData.one_way == true){
    var cameraPoint2 = {mapPoint:$scope.marker2.resource_uri,top:0,left:0,height:0,width:0}
  }
  else{
    var cameraPoint2 = {
    mapPoint:$scope.marker2.resource_uri,
    top:(convertToPercent(pInt(element2.css('top')),$scope.selected_camera.height)),
    left:(convertToPercent(pInt(element2.css('left')),$scope.selected_camera.width)),
    height:convertToPercent(pInt(element2.css('height')),$scope.selected_camera.height),
    width:convertToPercent(pInt(element2.css('width')),$scope.selected_camera.width)
    }
  }
  console.log(cameraPoint1,cameraPoint2);
  if($scope.draggable_item[0].resource_uri != undefined){
    restService.putDataByUri($scope.draggable_item[0].resource_uri,cameraPoint1).then(function(response){
      console.log('putCameraPoint1',response)
      $scope.formData.cameraPoint1 = response.data.resource_uri;
      restService.putDataByUri($scope.draggable_item[1].resource_uri,cameraPoint2).then(function(response){
        console.log('putCameraPoint2',response)
        $scope.formData.cameraPoint2 = response.data.resource_uri;
        $scope.formData.camera = $scope.selected_camera.resource_uri,
        console.log('$scope.formData',$scope.formData);
        restService.putDataByUri($scope.formData.resource_uri,$scope.formData).then(function(response){
          console.log('putDataRelation',response)
        })
      });
    });
  }
  else{
    restService.postCameraPoint(cameraPoint1).then(function(response){
      console.log('postCameraPoint1',response)
      $scope.formData.cameraPoint1 = response.data.resource_uri;
      restService.postCameraPoint(cameraPoint2).then(function(response){
        console.log('postCameraPoint2',response)
        $scope.formData.cameraPoint2 = response.data.resource_uri;
        $scope.formData.camera = $scope.selected_camera.resource_uri,
        console.log('$scope.formData',$scope.formData);
        restService.postDataRelation($scope.formData).then(function(response){
          console.log('postDataRelation',response)
        })
      });
    });
  }
  
  $modalInstance.close();
};

$scope.cancel = function () {
  $modalInstance.dismiss('cancel');
};
$scope.getStyle = function(item_no) {
  console.log('getStyled')
  var item = $scope.draggable_item[item_no]

  var height = $scope.selected_camera.height;
  var width = $scope.selected_camera.width;
  $( "#draggable-zone1" ).draggable({ containment: "#camera-wrapper", scroll: false }).resizable()
  $( "#draggable-zone2" ).draggable({ containment: "#camera-wrapper", scroll: false }).resizable()
    
  if(item_no == 0){
    return {'background-color':item.color,
      'left':item.left*width+'px',
      'top':item.top*height+'px',
      'width':item.width*width+'px',
      'height':item.height*height+'px'
    }
  }else{
    var item1 = $scope.draggable_item[0]
    return {'background-color':item.color,
      'left':item.left*width+'px',
      'top':item.top*height+'px',
      'width':item.width*width+'px',
      'height':item.height*height+'px'
    }
  }
}
});
