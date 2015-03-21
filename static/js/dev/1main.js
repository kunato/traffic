var app = angular.module('app', ['ui.bootstrap','chart.js']);
app.config(['$httpProvider', function($httpProvider){
        // django and angular both support csrf tokens. This tells
        // angular which cookie to add to what header.
        $httpProvider.defaults.xsrfCookieName = 'csrftoken';
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
    }])
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

