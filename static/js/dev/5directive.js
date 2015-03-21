app.directive('loadFinishDraggable', function($timeout) {
  return function(scope, element, attrs) {
    angular.element(element).css('color','blue');
    if (scope.$last){
      $timeout(function () {
        for(var i = 0 ; i <= scope.$index ; i++){
          $( "#"+i ).draggable({ containment: "#map-wrapper", scroll: false })
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