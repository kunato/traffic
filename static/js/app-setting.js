app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/',{
        templateUrl: '/static/html/setting.html',
        controller: 'MapSettingController',
        title:'Setting'
      })
  }]);