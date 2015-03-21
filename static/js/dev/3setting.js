app.controller('MapSettingController', function(restService, $scope , $http , $modal , $log) {
  restService.getCamera().then(function(response){
    $scope.test = response.data.objects[0];
    console.log('test',$scope.test)
    $scope.test.id = undefined
    $scope.test.url = "realurl"

    restService.postCamera($scope.test).then(function(response){
      console.log('post',response)
    })
  })

  $scope.points = [];
  $scope.nextId = 0;
  $scope.test = function(){
    console.log('test')
  }

  
  $scope.open = function (point) {
    console.log(point)
    var modalInstance = $modal.open({
      templateUrl: 'modal_setting.html',
      controller: 'ModalCameraCtrl',
      size:'lg',
      resolve: {
        items: function () {
          return point;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };
  $scope.add = function(){
    $scope.points.push({id:$scope.nextId,color:getRandomColor(),camera:{id:-1,top:'0px',left:'0px',height:'0px',width:'0px'},top:'0px',left:'0px',show:true});
    $scope.nextId += 1;
  }
});

app.controller('ModalCameraCtrl', function ($scope, $modalInstance, items) {

  //get camera list
  $scope.camera = [ {id:0,name:"Camera1",img:"img/example-camera.png",width:854,height:480}, {id:1,name:"Camera2",img:"img/example-camera.png",width:854,height:480}, {id:2,name:"Camera3",img:"img/example-camera.png",width:854,height:480} ];
  $scope.item = items;
  console.log($scope.item.camera)
  if($scope.item.camera.id != '-1'){
    $scope.selected_camera = $scope.camera[parseInt($scope.item.camera.id)];
    console.log('test')
  }
  else{
    $scope.selected_camera = $scope.camera[0]
  }
  console.log('tt',$scope.selected_camera)
  angular.copy(items, $scope.backup);
  //set camera position and param
  $scope.getCameraImg = function(){
    console.log($scope.selected_camera)
    if($scope.selected_camera == undefined || $scope.selected_camera.img == undefined){
      return '';
    }
    else{
      console.log("yes")
      return {'background-image':'url(' + $scope.selected_camera.img + ')',
      'width':$scope.selected_camera.width+'px',
      'height':$scope.selected_camera.height+'px'
    }
  }
}
$scope.ok = function () {
  var element = angular.element("#draggable-zone");

  $scope.item.camera = {'id':$scope.selected_camera.id,top:convertToPercent(element.css('top'),$scope.selected_camera.height),left:convertToPercent(element.css('left'),$scope.selected_camera.width),height:convertToPercent(element.css('height'),$scope.selected_camera.height),width:convertToPercent(element.css('width'),$scope.selected_camera.width)};
  console.log('$scope.item',$scope.item);
  $modalInstance.close();
};

$scope.cancel = function () {
  items = $scope.backup;
  $modalInstance.dismiss('cancel');
};
$scope.remove = function() {
  $scope.item.show = false;
  $modalInstance.close();
}
$scope.getStyle = function(item) {
  console.log('getDraggableStyle')
  var height = $scope.selected_camera.height;
  var width = $scope.selected_camera.width;
  var t = 'background-color:'+item.color+';left:'+item.camera.left*width+'px;top:'+item.camera.top*height+'px;height:'+item.camera.height*height+'px;width:'+item.camera.width*width+'px;'
  console.log('ss',t);
  return t;
}
});