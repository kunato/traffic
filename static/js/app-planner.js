app.controller('PlannerController', function(restService, $scope , $http , $modal , $log, uiGmapGoogleMapApi, $timeout) {
  $scope.polys = [];
  $scope.time = new Date()
  $scope.datetime = {start:new Date((new Date().getTime() - 10 * 60000)),end:new Date()}
  $scope.duration = 1
  $scope.render = false;
  //console.log("we in PlannerController");
  $scope.dataRelation = [];
  $scope.markers2 = [];
  $scope.polys2 = [];
  $scope.$watch('datetime',function(){
    //re-render poly line and request traffic from server
    for(var i = 0 ; i < $scope.dataRelation.length ; i++){

      restService.getTrafficFromDataRelation($scope.dataRelation[i].id,$scope.datetime.start,$scope.datetime.end).then(function(response){
        // //console.log('traffic',response.data)
        for(var j = 0 ; j < $scope.dataRelation.length ; j++){
          if($scope.dataRelation[j].id == response.data.data_relation_id){
            $scope.dataRelation[j].traffic = response.data.data;
            //console.log('traffic',$scope.dataRelation[j],response.data.data)
          }
        }
        // //console.log($scope.dataRelation)
      });
    }
    // //console.log("datetime change",$scope.datetime)
  },true);
  $scope.getLatLngDataFromDataRelation = function(dataRelation,i,length){
    if(i == length){
      $scope.render = true;
      return;
    }
    restService.getTrafficFromDataRelation(dataRelation[i].id,$scope.datetime.start,$scope.datetime.end).then(function(response){
      var traffic = response.data
      // //console.log('traffc',response.data)
      restService.getDataByUri(dataRelation[i].cameraPoint1).then(function(response){
        var cameraPoint1 = response.data.mapPoint;
        // //console.log('cameraPoint1',response.data)
        restService.getDataByUri(dataRelation[i].cameraPoint2).then(function(response2){
          var cameraPoint2 = response2.data.mapPoint;
          // //console.log('cameraPoint2',response2.data)
          uiGmapGoogleMapApi.then(function(){
            var request = {
              origin: new google.maps.LatLng(cameraPoint2.latitude,cameraPoint2.longitude),
              destination: new google.maps.LatLng(cameraPoint1.latitude,cameraPoint1.longitude),
              travelMode: google.maps.DirectionsTravelMode.WALKING
            };
            // //console.log('sent directionsService with', request);
            directionsService = new google.maps.DirectionsService(),
            directionsService.route(request, function (response, status) {
              // //console.log('directionsService',response)
              if(response == null){
                $scope.getLatLngDataFromDataRelation(dataRelation,i,length)
                return
              }
              var saved_path = response.routes[0].overview_path; 
              $scope.dataRelation.push({id:dataRelation[i].id,
                path:saved_path,traffic:traffic.data,'description':response.routes[0].summary,
                distance:response.routes[0].legs[0].distance.value,
                cameraPoint1:cameraPoint1,cameraPoint2:cameraPoint2,one_way:dataRelation[i].one_way})
              // //console.log($scope.dataRelation);
              $timeout(function(){
              $scope.getLatLngDataFromDataRelation(dataRelation,i+1,length)
            },50);
            });
          });
        });
      });
    });
  }
  restService.getDataRelation().then(function(response){
    // //console.log('data',response.data.objects)
    var dataRelation = response.data.objects
    var i = 0;

    $scope.getLatLngDataFromDataRelation(dataRelation,i,dataRelation.length);

  });


  $scope.calculateRoute = function(){
    var backup_dataRelation = angular.copy($scope.dataRelation)
    //markers2 [0] is start [1] is end
    var latlng_start = new google.maps.LatLng($scope.markers2[0].latitude,$scope.markers2[0].longitude)
    var latlng_end = new google.maps.LatLng($scope.markers2[1].latitude,$scope.markers2[1].longitude)
    var g = new Graph();
    var traffic_data = []
    for(var i = 0 ; i < $scope.dataRelation.length ; i++){
      //if no traffic data set traffic = 10
      for(var j = 0 ; j < $scope.dataRelation[i].traffic.length ; j++){
        if($scope.dataRelation[i].traffic[j].speed == 0){
          $scope.dataRelation[i].traffic[j].speed = 10;
        }
      }
      var obj = {}
      //TODO add traffic
      obj[$scope.dataRelation[i].cameraPoint2.id] = $scope.dataRelation[i].distance/$scope.dataRelation[i].traffic[0].speed
      g.addVertex($scope.dataRelation[i].cameraPoint1.id, obj);

      if(!$scope.dataRelation[i].one_way){
        var obj = {}
        //TODO add traffic
        obj[$scope.dataRelation[i].cameraPoint1.id] = $scope.dataRelation[i].distance/$scope.dataRelation[i].traffic[1].speed
        g.addVertex($scope.dataRelation[i].cameraPoint2.id, obj);
      }
      else{
        var obj = {}
        g.addVertex($scope.dataRelation[i].cameraPoint2.id,obj)
      }

    }

    var start_min_index = -1;
    var start_min_node = -1;
    var end_min_index = -1;
    var end_min_node = -1;
    var end_min = 1.0/0;
    var start_min = 1.0/0;
    //calc where the start point and end point
    //edit this
    //console.log($scope.dataRelation)
    for(var i = 0 ; i < $scope.dataRelation.length ; i++){
      for(var j = 0 ; j < $scope.dataRelation[i].path.length-1 ; j++){
        var distance = getDistance($scope.dataRelation[i].path[j],$scope.dataRelation[i].path[j+1]);
        var divideBy = Math.floor(distance/20);
        var diff = [($scope.dataRelation[i].path[j+1].B-$scope.dataRelation[i].path[j].B)/divideBy,($scope.dataRelation[i].path[j+1].k-$scope.dataRelation[i].path[j].k)/divideBy]
        
        for(var k = 1 ; k < divideBy ; k++){
          if((j == 0 && k == 0) || (k == divideBy && j == $scope.dataRelation[i].path.length-2)){
            continue
          }
          if(k > divideBy/2){
            var check_pos = new google.maps.LatLng($scope.dataRelation[i].path[j+1].k-(diff[1]*(divideBy-k)),$scope.dataRelation[i].path[j+1].B-(diff[0]*(divideBy-k)));
          }
          else{
            var check_pos = new google.maps.LatLng($scope.dataRelation[i].path[j].k+(diff[1]*k),$scope.dataRelation[i].path[j].B+(diff[0]*k));
          }
          var value = getDistance(check_pos,latlng_start)
          // $scope.markers2.push({
          //   id: nextId,
          //   latitude: check_pos.lat(),
          //   longitude: check_pos.lng()
          // });
          if(value < start_min){
            start_min = value;
            start_min_index = i;
          }
          var value2 = getDistance(check_pos,latlng_end)
          if(value2 < end_min){
            end_min = value2;
            end_min_index = i;
          }
        }


      }
    }
    //check if start_min_index == end_min_index
    if(start_min_index == end_min_index){
      var start_path_temp = $scope.dataRelation[start_min_index].path
      var save_start_path = []
      for(var i = 0 ; i < start_path_temp.length-1 ; i++){
        var distance = getDistance(start_path_temp[i],start_path_temp[i+1]);
        var divideBy = Math.floor(distance/20);

        var diff = [(start_path_temp[i+1].B-start_path_temp[i].B)/divideBy,(start_path_temp[i+1].k-start_path_temp[i].k)/divideBy]
        save_start_path.push(start_path_temp[i])
        for(var j = 0 ; j < divideBy ; j++){
          var t = new google.maps.LatLng(start_path_temp[i].k+(diff[1]*j),start_path_temp[i].B+(diff[0]*j))
          save_start_path.push(t)
        }
        if(i == start_path_temp.length-2)
          save_start_path.push(start_path_temp[i+1])
      }
      $scope.dataRelation[start_min_index].path = save_start_path;
      start_min = 1/0; 
      for(var i = 0 ; i < $scope.dataRelation[start_min_index].path.length ; i++){
        var value = calcDistance($scope.dataRelation[start_min_index].path[i],latlng_start)
        if(value <= start_min){
          start_min = value
          start_min_node = i

        }
      }
      end_min = 1/0;
      for(var i = 0 ; i < $scope.dataRelation[end_min_index].path.length ; i++){
        var value = calcDistance($scope.dataRelation[end_min_index].path[i],latlng_end)
        if(value <= end_min){
          end_min = value
          end_min_node = i

        }
      }

    //TODO add traffic
    var all_path = [];
    var lower_node = undefined
    var higher_node = undefined
    var result = 0
    if(start_min_node > end_min_node){
      result = getDistance($scope.dataRelation[start_min_index].path[start_min_node],$scope.dataRelation[start_min_index].path[end_min_node]) / $scope.dataRelation[start_min_index].traffic[0].speed 
      lower_node = end_min_node;
      higher_node = start_min_node
    }else if(end_min_node > start_min_node && ! $scope.dataRelation[start_min_index].one_way){
      result =  getDistance($scope.dataRelation[start_min_index].path[start_min_node],$scope.dataRelation[start_min_index].path[end_min_node]) / $scope.dataRelation[start_min_index].traffic[1].speed;
      lower_node = start_min_node;
      higher_node = end_min_node;
    }
    else if(end_min_node == start_min_node){
      //console.log("ROUTE NOT FOUND")
      $scope.dataRelation = backup_dataRelation;
      return
    }
    else{
      //console.log("ROUTE NOT FOUND")
      $scope.dataRelation = backup_dataRelation;
      return
    }
    $scope.polys2 = [{},{},{}]
    for(var i = lower_node ; i < higher_node ; i++){
      all_path.push($scope.dataRelation[start_min_index].path[i])
    }
    $scope.polys2[0].path = all_path;
    $scope.polys2[1].stroke = {color:'#ff00ff',weight:2,opacity:1.0}
    $scope.polys2[2].stroke = {color:'#ff00ff',weight:2,opacity:1.0}
    if(end_min_node > start_min_node){
      $scope.polys2[0].stroke = {color:getColorFromTraffic($scope.dataRelation[start_min_index].traffic[1].speed,$scope.dataRelation[start_min_index].traffic[1].count),weight:2,opacity:1.0}
    
      $scope.polys2[1].path = [{latitude:latlng_start.k,longitude:latlng_start.B},all_path[0]]
      $scope.polys2[2].path = [{latitude:latlng_end.k,longitude:latlng_end.B},all_path[all_path.length-1]] 
    }
    else{
      $scope.polys2[0].stroke = {color:getColorFromTraffic($scope.dataRelation[start_min_index].traffic[0].speed,$scope.dataRelation[start_min_index].traffic[0].count),weight:2,opacity:1.0}
    
      $scope.polys2[1].path = [{latitude:latlng_start.k,longitude:latlng_start.B},all_path[all_path.length-1]]
      $scope.polys2[2].path = [{latitude:latlng_end.k,longitude:latlng_end.B},all_path[0]] 
    }
    $scope.dataRelation = backup_dataRelation;
    return
  }
    //seperate min path
    var start_path_temp = $scope.dataRelation[start_min_index].path
    var save_start_path = []
    var end_path_temp = $scope.dataRelation[end_min_index].path
    var save_end_path = []
    for(var i = 0 ; i < start_path_temp.length-1 ; i++){
      var distance = getDistance(start_path_temp[i],start_path_temp[i+1]);
      var divideBy = Math.floor(distance/20);
      
      var diff = [(start_path_temp[i+1].B-start_path_temp[i].B)/divideBy,(start_path_temp[i+1].k-start_path_temp[i].k)/divideBy]
      save_start_path.push(start_path_temp[i])
      for(var j = 0 ; j < divideBy ; j++){
        var t = new google.maps.LatLng(start_path_temp[i].k+(diff[1]*j),start_path_temp[i].B+(diff[0]*j))
        save_start_path.push(t)
      }
      if(i == start_path_temp.length-2)
        save_start_path.push(start_path_temp[i+1])
    }
    $scope.dataRelation[start_min_index].path = save_start_path;

    for(var i = 0 ; i < end_path_temp.length-1 ; i++){
      var distance = getDistance(end_path_temp[i],end_path_temp[i+1]);
      var divideBy = Math.floor(distance/20);
      var diff = [(end_path_temp[i+1].B-end_path_temp[i].B)/divideBy,(end_path_temp[i+1].k-end_path_temp[i].k)/divideBy]
      save_end_path.push(end_path_temp[i])
      for(var j = 0 ; j < divideBy ; j++){
        var t = new google.maps.LatLng(end_path_temp[i].k+(diff[1]*j),end_path_temp[i].B+(diff[0]*j))
        save_end_path.push(t)
      }
      if(i == end_path_temp.length-2)
        save_end_path.push(end_path_temp[i+1])
    }
    $scope.dataRelation[end_min_index].path = save_end_path;

    start_min = 1/0
    for(var i = 0 ; i < $scope.dataRelation[start_min_index].path.length ; i++){
      var value = calcDistance($scope.dataRelation[start_min_index].path[i],latlng_start)
      if(value <= start_min){
        start_min = value
        start_min_node = i

      }
    }

    end_min = 1/0
    for(var i = 0 ; i < $scope.dataRelation[end_min_index].path.length ; i++){
      var value = calcDistance($scope.dataRelation[end_min_index].path[i],latlng_end)
      if(value <= end_min){
        end_min = value
        end_min_node = i

      }
    }
    var start = [0,0]
    var start_id = [-1,-1]
    var end = [0,0]
    var end_id = [-1,-1]
    var result = [[0,0],[0,0]]
    var result_node = [[0,0],[0,0]]
    // if one way calc only on start[1] or end[1]
    start[0] = getDistance(new google.maps.LatLng($scope.dataRelation[start_min_index].cameraPoint1.latitude,$scope.dataRelation[start_min_index].cameraPoint1.longitude),$scope.dataRelation[start_min_index].path[start_min_node]);
    start[1] = getDistance(new google.maps.LatLng($scope.dataRelation[start_min_index].cameraPoint2.latitude,$scope.dataRelation[start_min_index].cameraPoint2.longitude),$scope.dataRelation[start_min_index].path[start_min_node]);
    start_id[0] = $scope.dataRelation[start_min_index].cameraPoint1.id
    start_id[1] = $scope.dataRelation[start_min_index].cameraPoint2.id
    end_id[0] = $scope.dataRelation[end_min_index].cameraPoint1.id
    end_id[1] = $scope.dataRelation[end_min_index].cameraPoint2.id
    end[0] = getDistance(new google.maps.LatLng($scope.dataRelation[end_min_index].cameraPoint1.latitude,$scope.dataRelation[end_min_index].cameraPoint1.longitude),$scope.dataRelation[end_min_index].path[end_min_node]);
    end[1] = getDistance(new google.maps.LatLng($scope.dataRelation[end_min_index].cameraPoint2.latitude,$scope.dataRelation[end_min_index].cameraPoint2.longitude),$scope.dataRelation[end_min_index].path[end_min_node]);
    
    if($scope.dataRelation[start_min_index].one_way)
      start[0] = 1/0
    if($scope.dataRelation[end_min_index].one_way)
      end[1] = 1/0
    for(var i = 0; i < start.length ; i++){
      for(var j = 0 ; j < end.length ; j++){
        //TODO add traffic on start+end
        //if start[0] traffic[0] 
        //if start[1] traffic[1]
        result[i][j] = 0
        if(i == 0){
          result[i][j] += start[i]/$scope.dataRelation[start_min_index].traffic[1].speed
        }
        else{
          result[i][j] += start[i]/$scope.dataRelation[start_min_index].traffic[0].speed
        }
        if(j == 0){
          result[i][j] += end[j]/$scope.dataRelation[end_min_index].traffic[1].speed
        }
        else{
          result[i][j] += end[j]/$scope.dataRelation[end_min_index].traffic[0].speed
        }

        var route_temp = g.shortestPath(String(start_id[i]),String(end_id[j])).concat([String(start_id[i])]).reverse();
        result_node[i][j] = route_temp;
        for(var k = 0 ; k < route_temp.length-1 ;k++){
          result[i][j] += g.getVertices()[route_temp[k]][route_temp[k+1]];
        }
        if((route_temp[0] != String(start_id[0]) && route_temp[0] != String(start_id[1]) ) || (route_temp[route_temp.length-1] != String(end_id[0]) && route_temp[route_temp.length-1] != String(end_id[1]))){
         result[i][j] = 1/0;   
       }
     }
   }

   var min_start = -1
   var min_end = -1
   var min_result = 1/0;
    //sort and check there is no route or not
    for(var i = 0 ; i < start.length ; i++){
      for(var j = 0 ; j < end.length ; j++){
        if(result[i][j] < min_result){
          min_result = result[i][j];
          min_start = i;
          min_end = j;
        }
      }
    }
    //console.log(min_result);
    var start_path = []
    var end_path = []

    if(min_start == -1){
      $scope.polys2 = []
      //console.log("NO ROUTE FOUND")
      $scope.dataRelation = backup_dataRelation;
      return
    }
    $scope.polys2 = [{},{},{},{}]
    if(result_node[min_start][min_end][0] == $scope.dataRelation[start_min_index].cameraPoint1.id){
      for(var i = $scope.dataRelation[start_min_index].path.length-1 ; i >= start_min_node  ; i--){
        start_path.push($scope.dataRelation[start_min_index].path[i])
      }
      $scope.polys2[0].stroke = {color:getColorFromTraffic($scope.dataRelation[start_min_index].traffic[1].speed,$scope.dataRelation[start_min_index].traffic[1].count),weight:2,opacity:1.0}

    }
    else{
      for(var i = 0 ; i <= start_min_node ; i++){
        start_path.push($scope.dataRelation[start_min_index].path[i])
      }
      $scope.polys2[0].stroke = {color:getColorFromTraffic($scope.dataRelation[start_min_index].traffic[0].speed,$scope.dataRelation[start_min_index].traffic[0].count),weight:2,opacity:1.0}

    }

    if(result_node[min_start][min_end][result_node[min_start][min_end].length-1] == $scope.dataRelation[end_min_index].cameraPoint1.id){
      
      for(var i = $scope.dataRelation[end_min_index].path.length-1 ; i  >= end_min_node ; i--){
        end_path.push($scope.dataRelation[end_min_index].path[i])
      }
      $scope.polys2[1].stroke = {color:getColorFromTraffic($scope.dataRelation[end_min_index].traffic[0].speed,$scope.dataRelation[end_min_index].traffic[0].count),weight:2,opacity:1.0}

    }
    else{
      for(var i = 0 ; i <= end_min_node ; i++){
        end_path.push($scope.dataRelation[end_min_index].path[i])
      }
      $scope.polys2[1].stroke = {color:getColorFromTraffic($scope.dataRelation[end_min_index].traffic[1].speed,$scope.dataRelation[end_min_index].traffic[1].count),weight:2,opacity:1.0}

    }
    $scope.polys2[0].path = start_path;
    $scope.polys2[1].path = end_path;

    $scope.polys2[2].stroke = {color:'#ff00ff',weight:2,opacity:1.0}
    $scope.polys2[3].stroke = {color:'#ff00ff',weight:2,opacity:1.0}
    $scope.polys2[2].path = [{latitude:latlng_start.k,longitude:latlng_start.B},start_path[start_path.length-1]]
    $scope.polys2[3].path = [{latitude:latlng_end.k,longitude:latlng_end.B},end_path[end_path.length-1]]
    for(var i = 0 ; i < $scope.dataRelation.length ; i++){
      for(var j = 0 ; j < result_node[min_start][min_end].length ; j++){
        if((result_node[min_start][min_end][j] == $scope.dataRelation[i].cameraPoint1.id && result_node[min_start][min_end][j+1] == $scope.dataRelation[i].cameraPoint2.id)){
          $scope.polys2.push({})
          var index = $scope.polys2.length-1
          $scope.polys2[index].path =  $scope.dataRelation[i].path
          $scope.polys2[index].stroke = {color:getColorFromTraffic($scope.dataRelation[i].traffic[0].speed,$scope.dataRelation[end_min_index].traffic[0].count),weight:2,opacity:1.0}
        }
        else if((result_node[min_start][min_end][j] == $scope.dataRelation[i].cameraPoint2.id && result_node[min_start][min_end][j+1] == $scope.dataRelation[i].cameraPoint1.id)){
          $scope.polys2.push({})
          var index = $scope.polys2.length-1
          $scope.polys2[index].path =  $scope.dataRelation[i].path
          $scope.polys2[index].stroke = {color:getColorFromTraffic($scope.dataRelation[i].traffic[1].speed,$scope.dataRelation[end_min_index].traffic[1].count),weight:2,opacity:1.0}

        }
      }
      
    }
    $scope.dataRelation = backup_dataRelation;
  }
  $scope.renderPolyline = function(){
    var events = {
      click: function (mapModel, eventName, originalEventArgs) {
          // 'this' is the directive's scope

            //this is hotfix id
            var id = originalEventArgs.icons
            // $scope.open(id);
            //$log.info("dataRelation id :",originalEventArgs.icons)
          }
        }
        $scope.polys = [];
        for (var i = 0 ; i < $scope.dataRelation.length ;i++){
          var path1 = angular.copy($scope.dataRelation[i].path);
          for(var j = 0 ; j < path1.length ; j++){
            if((j == 0 || j == path1.length -1 ) && $scope.dataRelation[i].one_way == false){
          // path1[j].B += 0.00010/2.0
          // path1[j].k += 0.00003/2.0
        }
      }
      $scope.polys.push({})
      var index = $scope.polys.length-1
      $scope.polys[index].id = $scope.dataRelation[i].id
      $scope.polys[index].path = path1
      $scope.polys[index].stroke = {color:getColorFromTraffic($scope.dataRelation[i].traffic[0].speed,$scope.dataRelation[i].traffic[0].count),weight:2,opacity:1.0}
      $scope.polys[index].events = events;
      if($scope.dataRelation[i].one_way == true){
        //$scope.polys[i*2+1] = {}
        continue;
      }
      var path = angular.copy($scope.dataRelation[i].path)
      for(var j = 0 ; j < path.length ; j++){
          //calculate from average of all path
          path[j].B += 0.00003
          path[j].k += 0.00006
        }
        $scope.polys.push({})
        var index = $scope.polys.length-1
        $scope.polys[index].id = $scope.dataRelation[i].id
        $scope.polys[index].path = path
        $scope.polys[index].stroke = {color:getColorFromTraffic($scope.dataRelation[i].traffic[1].speed,$scope.dataRelation[i].traffic[1].count),weight:2,opacity:1.0}
        $scope.polys[index].events = events;
      }
    }

    $scope.$watch('dataRelation',function(){
      $scope.renderPolyline();
    },true);
    $scope.$watch('polys',function(){
    },true);
    $scope.deletedMarkers = []
    restService.getMap().then(function(response){
      //$log.info('getMap',response)
      $scope.map = {center: {latitude:response.data.objects[0].center_lat,longitude:response.data.objects[0].center_lng},zoom:response.data.objects[0].zoom,events: {
        click: function (mapModel, eventName, originalEventArgs) {
            // 'this' is the directive's scope
            var e = originalEventArgs[0];
            var lat = e.latLng.lat(),lon = e.latLng.lng();
            if($scope.markers2.length == 2){
              $scope.markers2 = [];
              $scope.polys2 = [];
            }
            $scope.markers2.push({
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
        }}
        $scope.map_id = response.data.objects[0].resource_uri;
      });
  $scope.markers = [];
  restService.getMapPoint().then(function(response){
    $scope.markers = response.data.objects;
  });
    //get from databases
    var nextId = -1;
    $scope.save = function(){
      //$log.info('save')
      for(var i = 0 ; i < $scope.markers.length ; i++){

        var formData = {latitude:$scope.markers[i].latitude,longitude:$scope.markers[i].longitude,map:$scope.map_id};
        if($scope.markers[i].options != undefined){
          restService.postMapPoint(formData).then(function(response){
            //$log.info('sent post resp : '+response);
          });
        }
        else{
          restService.postMapPointById($scope.markers[i].id,formData).then(function(response){
            //$log.info('sent post by id resp : '+response);
          });
        }
      }
      for(var i = 0 ; i < $scope.deletedMarkers.length ; i++){
        if($scope.deletedMarkers[i].id > 0){
          restService.deleteMapPoint($scope.deletedMarkers[i].id).then(function(response){
            //console.log('delete marker resp :',response)
          })
        }
      }

    }
    $scope.onMarkerClicked = function (marker) {
      //$log.info('clicked on markers :'+marker)
      marker.showWindow = true;
      $scope.$apply();
    };
    $scope.editTime = function () {
      //console.log("openTime");
      var modalInstance = $modal.open({
        templateUrl: '/static/html/modal_time.html',
        controller: 'ModalTimeCtrl',
        size:'sm',
        resolve: {
          datetime: function () {
            return $scope.datetime;
          }
        }
      });

      modalInstance.result.then(function () {
      }, function () {
        //$log.info('datetime',$scope.datetime)
        //$log.info('Modal dismissed at: ' + new Date());
      });
    }

    // $scope.open = function (id) {
    //   var object = undefined;
    //   for(var i = 0 ; i < $scope.dataRelation.length ;i++){
    //     if(id == $scope.dataRelation[i].id){
    //       object = $scope.dataRelation[i]
    //     }
    //   }
    //   var modalInstance = $modal.open({
    //     templateUrl: '/static/html/modal_report.html',
    //     controller: 'ModalReportCtrl',
    //     size:'lg',
    //     resolve:{
    //       item: function() {
    //         return object;
    //       },
    //       datetime: function() {
    //         return $scope.datetime;
    //       }
    //     }
    //   });

      // modalInstance.result.then(function (selectedItem) {
      //   $scope.selected = selectedItem;
      // }, function () {
      //   //$log.info('Modal dismissed at: ' + new Date());
      // });
    // };
  });
  // app.controller('ModalTimeCtrl', function (restService, $scope, $modalInstance , datetime) {
  //   $scope.datetime = datetime;
  //   //console.log(datetime.end)
  //   $scope.start = {date:new Date(datetime.start.getTime()),time:new Date(datetime.start.getTime())}
  //   $scope.end = {date:new Date(datetime.end.getTime()),time:new Date(datetime.end.getTime())}
  //   $scope.open_start = function($event) {
  //     $event.preventDefault();
  //     $event.stopPropagation();

  //     $scope.opened1 = true;
  //   };
  //   $scope.open_end = function($event) {
  //     $event.preventDefault();
  //     $event.stopPropagation();

  //     $scope.opened2 = true;
  //   };

  // $scope.ok = function () {
  //   $scope.datetime.start = new Date($scope.start.date.getFullYear(),$scope.start.date.getMonth(),$scope.start.date.getDate(),$scope.start.time.getHours(),$scope.start.time.getMinutes())
  //   $scope.datetime.end = new Date($scope.end.date.getFullYear(),$scope.end.date.getMonth(),$scope.end.date.getDate(),$scope.end.time.getHours(),$scope.end.time.getMinutes())
  //   $modalInstance.close();
  // };

  // $scope.cancel = function () {
  //   $modalInstance.dismiss('cancel');
  // };

  // });

  // app.controller('ModalReportCtrl', function (restService, $filter,$scope, $modalInstance,item,datetime) {
  //   //console.log(item);
  //   $scope.render = false
  //   $scope.item = item;
  //   $scope.data = [[],[]];
  //   $scope.data2 = [[],[]];
  //   $scope.timeData = [];
  //   var start = datetime.start.getTime();
  //   var end = datetime.end.getTime();
  //   var diff = end - start;
  //   $scope.labels = [];
  //   diff /= 11
  //   for(var i = 0 ; i < 11 ; i++){
  //     $scope.timeData.push(new Date(start+(diff*i)))
  //   }
  //   $scope.getTraffic = function(current,timeData){
  //     if(current == timeData.length-1){
  //       //console.log($scope.data)
  //       $scope.render = true;
  //       return
  //     }

  //     restService.getTrafficFromDataRelation($scope.item.id,timeData[current],timeData[current+1]).then(function(response){
  //       var traffic_data = response.data.data
  //       $scope.data[0].push(traffic_data[0].speed)
  //       $scope.data[1].push(traffic_data[1].speed)

  //       $scope.data2[0].push(traffic_data[0].count)
  //       $scope.data2[1].push(traffic_data[1].count)
  //       $scope.getTraffic(current+1,timeData)

  //       $scope.labels.push($filter('date')($scope.timeData[current], 'short'))
  //     });
  //   }
  //   $scope.getTraffic(0,$scope.timeData);

  //   $scope.series = [$scope.item.description+' ขาเข้า', $scope.item.description+' ขาออก'];

  //   // $scope.data = [
  //   //   [65, 59, 80, 81,65, 55, 80, 32,65, 59, 80, 81,65, 44, 80, 81,55, 59, 66, 81,65, 59, 80, 81],
  //   //   [28, 48, 40, 19,59, 80, 28, 48, 40, 81,28, 48, 40,59, 32, 81,59, 30, 81,44, 80, 22,59, 44]
  //   // ];
  //   // $scope.data2 = [
  //   //   [65, 59, 80, 81,65, 55, 80, 32,65, 59, 80, 81,65, 44, 80, 81,55, 59, 66, 81,65, 59, 80, 81],
  //   //   [28, 48, 40, 19,59, 80, 28, 48, 40, 81,28, 48, 40,59, 32, 81,59, 30, 81,44, 80, 22,59, 44]
  //   // ];

  // $scope.ok = function () {
  //   $modalInstance.close();
  // };
  // $scope.export = function(){
  //   //console.log('export');
  // }
  // $scope.cancel = function () {
  //   $modalInstance.dismiss('cancel');
  // };

  // });