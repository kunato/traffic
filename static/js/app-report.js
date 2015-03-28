app.controller('ReportController', function(restService, $scope , $http , $modal , $log, uiGmapGoogleMapApi) {
  $scope.polys = [];
  $scope.time = new Date()
  $scope.datetime = {start:new Date((new Date().getTime() - 10 * 60000)),end:new Date()}
  $scope.duration = 1
  $scope.render = false;
  console.log("we in ReportController");
  $scope.dataRelation = [];
  // restService.getMap().then(function(response){
  //   $scope.map = response.data.objects[0]
  //   restService.getMapPoint().then(function(response){
  //     console.log(response)
  //     $scope.points = response.data.objects;

  //     console.log('points',$scope.points);
  //   });
  // });
  $scope.$watch('datetime',function(){
    //re-render poly line and request traffic from server
    for(var i = 0 ; i < $scope.dataRelation.length ; i++){

      restService.getTrafficFromDataRelation($scope.dataRelation[i].id,$scope.datetime.start,$scope.datetime.end).then(function(response){
        console.log('traffic',response.data)
        for(var j = 0 ; j < $scope.dataRelation.length ; j++){
          if($scope.dataRelation[j].id == response.data.data_relation_id){
            $scope.dataRelation[j].traffic = response.data.data;
          }
        }
        console.log($scope.dataRelation)
      });
    }
    console.log("datetime change",$scope.datetime)
  },true);
  $scope.getLatLngDataFromDataRelation = function(dataRelation,i,length){
    if(i == length){
      $scope.render = true;
      return;
    }
      restService.getTrafficFromDataRelation(dataRelation[i].id,$scope.datetime.start,$scope.datetime.end).then(function(response){
        var traffic = response.data
      console.log('traffc',response.data)
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
            console.log('directionsService',response)
            $scope.dataRelation.push({id:dataRelation[i].id,path:response.routes[0].overview_path,traffic:traffic.data,'description':response.routes[0].summary})
            console.log($scope.dataRelation);
            $scope.getLatLngDataFromDataRelation(dataRelation,i+1,length)
          });
          });

        });
      });
    });
  }
  //TODO set start time and end time then go will refresh traffic object

  restService.getDataRelation().then(function(response){
    console.log('data',response.data.objects)
    var dataRelation = response.data.objects
    var i = 0;

    $scope.getLatLngDataFromDataRelation(dataRelation,i,dataRelation.length);
    
  });
  $scope.renderPolyline = function(){
    var events = {
          click: function (mapModel, eventName, originalEventArgs) {
          // 'this' is the directive's scope

            $log.info("user defined event: " + eventName, mapModel, originalEventArgs);
            //this is hotfix id
            var id = originalEventArgs.icons
            $scope.open(id);
            $log.info("dataRelation id :",originalEventArgs.icons)
        }
      }
    for (var i = 0 ; i < $scope.dataRelation.length ;i++){
        $scope.polys[i*2] = {}
        $scope.polys[i*2].id = $scope.dataRelation[i].id
        $scope.polys[i*2].path = angular.copy($scope.dataRelation[i].path)
        $scope.polys[i*2].stroke = {color:getColorFromTraffic($scope.dataRelation[i].traffic[0].speed,$scope.dataRelation[i].traffic[0].count),weight:2,opacity:1.0}
        $scope.polys[i*2].events = events;
      var path = angular.copy($scope.dataRelation[i].path)
      for(var j = 0 ; j < path.length ; j++){
        //if(!(j == 0 || j == path.length-1 || j ==1 || j == path.length-2)){
        path[j].B += 0.00005
        path[j].k += 0.00002
      //}
      }
      $scope.polys[i*2+1] = {}
        $scope.polys[i*2+1].id = $scope.dataRelation[i].id
        $scope.polys[i*2+1].path = path
        $scope.polys[i*2+1].stroke = {color:getColorFromTraffic($scope.dataRelation[i].traffic[1].speed,$scope.dataRelation[i].traffic[1].count),weight:2,opacity:1.0}
        $scope.polys[i*2+1].events = events;
    }
    console.log('polys',$scope.polys);
  }

  $scope.$watch('dataRelation',function(){
    console.log("dataRelation change",$scope.dataRelation)
    $scope.renderPolyline();
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
  $scope.map = { center: { latitude: 13.8468, longitude: 100.5680 }, zoom: 17 
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
  $scope.onMarkerClicked = function (marker) {
    $log.info('clicked on markers :'+marker)
    marker.showWindow = true;
    $scope.$apply();
  };
  $scope.editTime = function () {
    console.log("openTime");
    var modalInstance = $modal.open({
      templateUrl: '/static/html/modal_time.html',
      controller: 'ModalTimeCtrl',
      size:'lg',
      resolve: {
        datetime: function () {
          return $scope.datetime;
        }
      }
    });

    modalInstance.result.then(function () {
    }, function () {
      $log.info('datetime',$scope.datetime)
      $log.info('Modal dismissed at: ' + new Date());
    });
  }

  $scope.open = function (id) {
    var object = undefined;
    for(var i = 0 ; i < $scope.dataRelation.length ;i++){
      if(id == $scope.dataRelation[i].id){
        object = $scope.dataRelation[i]
      }
    }
    var modalInstance = $modal.open({
      templateUrl: '/static/html/modal_report.html',
      controller: 'ModalReportCtrl',
      size:'lg',
      resolve:{
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
    //   $log.info('Modal dismissed at: ' + new Date());
    // });
  };
});
app.controller('ModalTimeCtrl', function (restService, $scope, $modalInstance , datetime) {
  $scope.datetime = datetime;
  console.log(datetime.end)
  $scope.start = {date:new Date(datetime.start.getTime()),time:new Date(datetime.start.getTime())}
  $scope.end = {date:new Date(datetime.end.getTime()),time:new Date(datetime.end.getTime())}
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

$scope.ok = function () {
  $scope.datetime.start = new Date($scope.start.date.getFullYear(),$scope.start.date.getMonth(),$scope.start.date.getDate(),$scope.start.time.getHours(),$scope.start.time.getMinutes())
  $scope.datetime.end = new Date($scope.end.date.getFullYear(),$scope.end.date.getMonth(),$scope.end.date.getDate(),$scope.end.time.getHours(),$scope.end.time.getMinutes())
  $modalInstance.close();
};

$scope.cancel = function () {
  $modalInstance.dismiss('cancel');
};

});

app.controller('ModalReportCtrl', function (restService, $filter,$scope, $modalInstance,item,datetime) {
  console.log(item);
  $scope.render = false
  $scope.item = item;
  $scope.data = [[],[]];
  $scope.data2 = [[],[]];
  $scope.timeData = [];
  var start = datetime.start.getTime();
  var end = datetime.end.getTime();
  var diff = end - start;
  $scope.labels = [];
  diff /= 11
  for(var i = 0 ; i < 11 ; i++){
    $scope.timeData.push(new Date(start+(diff*i)))
  }
  $scope.getTraffic = function(current,timeData){
    if(current == timeData.length-1){
      console.log($scope.data)
      $scope.render = true;
      return
    }

    restService.getTrafficFromDataRelation($scope.item.id,timeData[current],timeData[current+1]).then(function(response){
      var traffic_data = response.data.data
      $scope.data[0].push(traffic_data[0].speed)
      $scope.data[1].push(traffic_data[1].speed)

      $scope.data2[0].push(traffic_data[0].count)
      $scope.data2[1].push(traffic_data[1].count)
      $scope.getTraffic(current+1,timeData)

      $scope.labels.push($filter('date')($scope.timeData[current], 'short'))
    });
  }
  $scope.getTraffic(0,$scope.timeData);

  $scope.series = [$scope.item.description+' ขาเข้า', $scope.item.description+' ขาออก'];

  // $scope.data = [
  //   [65, 59, 80, 81,65, 55, 80, 32,65, 59, 80, 81,65, 44, 80, 81,55, 59, 66, 81,65, 59, 80, 81],
  //   [28, 48, 40, 19,59, 80, 28, 48, 40, 81,28, 48, 40,59, 32, 81,59, 30, 81,44, 80, 22,59, 44]
  // ];
  // $scope.data2 = [
  //   [65, 59, 80, 81,65, 55, 80, 32,65, 59, 80, 81,65, 44, 80, 81,55, 59, 66, 81,65, 59, 80, 81],
  //   [28, 48, 40, 19,59, 80, 28, 48, 40, 81,28, 48, 40,59, 32, 81,59, 30, 81,44, 80, 22,59, 44]
  // ];

$scope.ok = function () {
  $modalInstance.close();
};

$scope.cancel = function () {
  $modalInstance.dismiss('cancel');
};

});