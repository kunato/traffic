var app = angular.module('app', ['ngRoute','ui.bootstrap','chart.js']);
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
app.service('restService', function($http, $rootScope) {
  return {
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
    getMapPoint: function(data){
      var path = '/api/v1/mapPoint/?format=json';
      return $http.get(path);
    },
    postMapPoint: function(data){
      var path = '/api/v1/mapPoint/?format=json';
      return $http.post(path,data)
    },
    postMapPointById: function(id,data){
      var path = '/api/v1/mapPoint/'+id+'/?format=json';
      return $http.put(path,data)
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
  var i = value.split('px')
  console.log(i)
  return i[0]/max;
}

app.controller('ReportController', function($scope , $http , $modal , $log) {
  $scope.options = [{text:'0.00 - 1.00',step:0},{text:'1.00 - 2.00',step:1},{text:'2.00 - 3.00',step:2},{text:'3.00 - 4.00',step:3},{text:'4.00 - 5.00',step:4},{text:'5.00 - 6.00',step:5},
    {text:'6.00 - 7.00',step:6},{text:'7.00 - 8.00',step:7},{text:'8.00 - 9.00',step:8},{text:'9.00 - 10.00',step:9},{text:'10.00 - 11.00',step:10},{text:'11.00 - 12.00',step:11},{text:'12.00 - 13.00',step:12},{text:'13.00 - 14.00',step:13},{text:'14.00 - 15.00',step:14},{text:'15.00 - 16.00',step:15},
    {text:'16.00 - 17.00',step:16},{text:'17.00 - 18.00',step:17},{text:'18.00 - 19.00',step:18},{text:'19.00 - 20.00',step:19},{text:'20.00 - 21.00',step:20},{text:'21.00 - 22.00',step:21},{text:'22.00 - 23.00',step:22},{text:'23.00 - 24.00',step:23},{text:'Full Day',step:24},{text:'Opening time',step:25},{text:'Week',step:26},{text:'Month',step:27}]
    
    $scope.date = '';
    //mock point
    $scope.points = [{id:0,color:"#0FF",left:"113px",top:"87px",show:true},{id:1,color:'#f0f',left:"252px",top:"514px",show:true},{id:2,"color":'#000',left:"1089px",top:"430px",show:true}]
    //mock data
    $scope.data = [{id:0,start:0,end:1,traffic:10,speed:10,color:'A3FF75'},{id:0,start:1,end:2,traffic:10,speed:10,color:'FF4719'}];
    $scope.r_datas = [];
    $scope.getDataStyle = function(r_data){
      return 'border-radius: 5px;padding:0px; margin:0px; height:4px; background-color:#' + r_data.color + '; line-height:1px; position:absolute; left:' + r_data.cx + "px; top:" + r_data.cy + "px; width:" + r_data.length + "px; -moz-transform:rotate(" + r_data.angle + "deg); -webkit-transform:rotate(" + r_data.angle + "deg); -o-transform:rotate(" + r_data.angle + "deg); -ms-transform:rotate(" + r_data.angle + "deg); transform:rotate(" + r_data.angle + 'deg)'
    }

    $scope.getStyle = function(item){
      var t = 'background-color:'+item.color+';left:'+item.left+';top:'+item.top+';'
      return t;
    }
    $scope.dt = function($event){

    $event.preventDefault();
    $event.stopPropagation();

    $scope.opened = true;
  }

    $scope.open = function (data) {
      var modalInstance = $modal.open({
        templateUrl: '/static/html/modal_report.html',
        controller: 'ModalReportCtrl',
        resolve: {
          items: function () {
            return data;
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

      $scope.points.push({save:true,id:$scope.nextId,color:getRandomColor(),camera:{id:'-1',top:'0px',left:'0px',height:'0px',width:'0px'},top:'0px',left:'0px',show:true});
      $scope.nextId += 1;
    }
  });

app.controller('ModalReportCtrl', function ($scope, $modalInstance, items) {
  $scope.labels = ['1-6', '7-12', '13-19', '20-24'];
  $scope.series = ['0 to 1', '1 to 0'];

  $scope.data = [
    [65, 59, 80, 81],
    [28, 48, 40, 19]
  ];
  $scope.data2 = [
    [81, 56, 55, 40],
    [19, 86, 27, 90]
  ];
  console.log(items);
  console.log($scope)
  $scope.item = items
  $scope.ok = function () {
    $modalInstance.close();
  };

  $scope.export = function () {
    //do export
    $modalInstance.dismiss('cancel');
  };
});app.controller('MapSettingController', function(restService, $scope , $http , $modal , $log) {
  restService.getMap().then(function(response){
    $scope.map = response.data.objects[0]
    restService.getMapPoint().then(function(response){
      console.log(response)
      $scope.points = response.data.objects;

      console.log('points',$scope.points);
    });
  });
  
  $scope.nextId = 0;
  $scope.test = function(){
    console.log('test')
  }

  $scope.getStyle = function(item) {
  var height = $scope.map.height;
  var width = $scope.map.width;
  var t = 'background-color:'+item.color+';left:'+item.left*width+'px;top:'+item.top*height+'px;'
  return t;
  }
  $scope.open = function (point) {
    console.log(point)
    var modalInstance = $modal.open({
      templateUrl: '/static/html/modal_setting.html',
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
    //add map point
    $scope.points.push({save:true,id:$scope.nextId,color:getRandomColor(),cameraPoint:{camera:{id:-1},id:-1,top:0,left:0,height:0,width:0},top:0,left:0,show:true});
    $scope.nextId += 1;
  }
  $scope.save = function(){
    for(var i = 0 ; i < $scope.points.length;i++){
      var post_item = $scope.points[i];
      var element = angular.element("#"+post_item.id);
      console.log('i',post_item)
      var formData = {color:post_item.color,top:convertToPercent(element.css('top'),$scope.map.height),left:convertToPercent(element.css('left'),$scope.map.width),map:$scope.map,cameraPoint:{camera:post_item.cameraPoint.camera,top:post_item.cameraPoint.top,height:post_item.cameraPoint.height,left:post_item.cameraPoint.left,width:post_item.cameraPoint.width}}
      console.log(post_item)
      if(post_item.save){

        restService.postMapPoint(formData).then(function(response){
        console.log(response)
      }
    );  
      }
      else{
        restService.postMapPointById(post_item.id,formData).then(function(response){
        console.log(response)
      }
    );
      }
      
  }
}
});

app.controller('ModalCameraCtrl', function (restService, $scope, $modalInstance, items) {
  
  $scope.item = items;
  console.log("item",$scope.item);
  //get camera list
  restService.getCamera().then(function(response){
    $scope.camera = response.data.objects;
    console.log('camera',$scope.camera)
    if($scope.item.cameraPoint.camera.id > 0){
        for(var i = 0 ; i < $scope.camera.length ; i++){
          if($scope.camera[i].id == $scope.item.cameraPoint.camera.id){
            $scope.selected_camera = $scope.camera[i]
            break;
          }
        }
  }
  else{
    $scope.selected_camera = $scope.camera[0]
  }
  console.log('selected_camera',$scope.selected_camera);
  });
  //$scope.camera = [ {id:0,name:"Camera1",img:"img/example-camera.png",width:854,height:480}, {id:1,name:"Camera2",img:"img/example-camera.png",width:854,height:480}, {id:2,name:"Camera3",img:"img/example-camera.png",width:854,height:480} ];
  
  console.log('tt',$scope.selected_camera)
  angular.copy(items, $scope.backup);
  //set camera position and param
  $scope.getCameraImg = function(){
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
  
  $scope.item.cameraPoint = {'id':$scope.selected_camera.id,camera:$scope.selected_camera,top:convertToPercent(element.css('top'),$scope.selected_camera.height),left:convertToPercent(element.css('left'),$scope.selected_camera.width),height:convertToPercent(element.css('height'),$scope.selected_camera.height),width:convertToPercent(element.css('width'),$scope.selected_camera.width)};
  console.log('$scope.item',$scope.item);
  items = $scope.items
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
  var height = $scope.selected_camera.height;
  var width = $scope.selected_camera.width;
  var t = 'background-color:'+item.color+';left:'+item.cameraPoint.left*width+'px;top:'+item.cameraPoint.top*height+'px;height:'+item.cameraPoint.height*height+'px;width:'+item.cameraPoint.width*width+'px;'
  return t;
}
});app.directive('loadFinishDraggable', function($timeout) {
  return function(scope, element, attrs) {
    angular.element(element).css('color','blue');
    if (scope.$last){
      $timeout(function () {
        for(var i = 0 ; i <= scope.points.length ; i++){
          $( "#"+scope.points[i].id ).draggable({ containment: "#map-wrapper", scroll: false })
        }
      });

    }
  };
})
app.directive('loadFinishReport', function($timeout) {
  return function(scope, element, attrs) {
    angular.element(element).css('color','blue');
    if (scope.$last){
      $timeout(function () {
      function getOffset( el ) { // return element top, left, width, height
        var _x = 0;
        var _y = 0;
        var _w = el.offsetWidth|0;
        var _h = el.offsetHeight|0;
        while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
          _x += el.offsetLeft - el.scrollLeft;
          _y += el.offsetTop - el.scrollTop;
          el = el.offsetParent;
        }
        return { top: _y, left: _x, width: _w, height: _h };
      }

      function connect(div1, div2, color, thickness, data) { // draw a line connecting elements
        console.log('test');
        var off1 = getOffset(div1);
        var off2 = getOffset(div2);
        console.log(off1)
          // bottom right
          var x1 = off1.left + off1.width/2;
          var y1 = off1.top + off1.height/2;
          // top right
          var x2 = off2.left + off2.width/2;
          var y2 = off2.top + off2.height/2;
          // distance
          var length = Math.sqrt(((x2-x1) * (x2-x1)) + ((y2-y1) * (y2-y1)));
          // center
          var cx = ((x1 + x2) / 2) - (length / 2);
          var cy = ((y1 + y2) / 2) - (thickness / 2);
          // angle
          var angle = Math.atan2((y1-y2),(x1-x2))*(180/Math.PI);
          // make hr
          return {x1:x1,y1:y1,x2:x2,y2:y2,length:length,cx:cx,cy:cy,angle:angle,color:color,data:data};
      }
      var data = scope.$parent.data;
      for (var i = 0 ; i < data.length ; i++){
          scope.$parent.r_datas.push(connect(document.getElementById(data[i].start),document.getElementById(data[i].end),data[i].color,4,scope.$parent.data[i]))
        }
      console.log('finish')
    });

  }
};
})