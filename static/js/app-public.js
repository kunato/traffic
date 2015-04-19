app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/report', {
        templateUrl: '/static/html/report.html',
        controller: 'ReportController',
        title:'Report'
      }).
      when('/plan',{
        templateUrl: '/static/html/plan.html',
        controller: 'PlannerController',
        title:'Planner'
      }).
      when('/',{
        redirectTo: "/report"
      })
  }]);