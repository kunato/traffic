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
        templateUrl: 'modal_report.html',
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
      $scope.points.push({id:$scope.nextId,color:getRandomColor(),camera:{id:'-1',top:'0px',left:'0px',height:'0px',width:'0px'},top:'0px',left:'0px',show:true});
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
});