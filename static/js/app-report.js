app.controller('ReportController', function(restService, $scope , $http , $modal , $log, uiGmapGoogleMapApi) {
  $scope.polys = [];
  $scope.time = new Date()
  $scope.duration = 1
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
            console.log($scope.dataRelation);
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
    for (var i = 0 ; i < $scope.dataRelation.length ;i++){
        $scope.polys[i] = $scope.dataRelation[i]
        $scope.polys[i].events = {
          click: function (mapModel, eventName, originalEventArgs) {
          // 'this' is the directive's scope

            $log.info("user defined event: " + eventName, mapModel, originalEventArgs);
            //this is hotfix id
            var id = originalEventArgs.icons
            $log.info("dataRelation id :",originalEventArgs.icons)
            restService.getTrafficFromDataRelation(id,$scope.time,$scope.duration).then(function(response){

            });
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
  $scope.open = function () {
    var modalInstance = $modal.open({
      templateUrl: '/static/html/modal_report.html',
      controller: 'ModalReportCtrl',
      size:'lg'
    });

    // modalInstance.result.then(function (selectedItem) {
    //   $scope.selected = selectedItem;
    // }, function () {
    //   $log.info('Modal dismissed at: ' + new Date());
    // });
  };
});

app.controller('ModalReportCtrl', function (restService, $scope, $modalInstance) {
$scope.labels = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24];
  $scope.series = ['ซอย สุธรรมอารีกุล ไป ซอย จันทรสถิตย์', 'ซอย จันทรสถิตย์ ไป ซอย สุธรรมอารีกุล'];

  $scope.data = [
    [65, 59, 80, 81,65, 55, 80, 32,65, 59, 80, 81,65, 44, 80, 81,55, 59, 66, 81,65, 59, 80, 81],
    [28, 48, 40, 19,59, 80, 28, 48, 40, 81,28, 48, 40,59, 32, 81,59, 30, 81,44, 80, 22,59, 44]
  ];
  $scope.data2 = [
    [65, 59, 80, 81,65, 55, 80, 32,65, 59, 80, 81,65, 44, 80, 81,55, 59, 66, 81,65, 59, 80, 81],
    [28, 48, 40, 19,59, 80, 28, 48, 40, 81,28, 48, 40,59, 32, 81,59, 30, 81,44, 80, 22,59, 44]
  ];

$scope.ok = function () {
  $modalInstance.close();
};

$scope.cancel = function () {
  $modalInstance.dismiss('cancel');
};

});