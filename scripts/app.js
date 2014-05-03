angular.module('yellio', ['ngCookies', 'ngResource', 'ngRoute', 'ngAnimate']).config(function($routeProvider) {
  return $routeProvider.when('/', {
    templateUrl: 'partials/home.html',
    controller: 'HomeCtrl'
  }).when('/r/:name', {
    templateUrl: 'partials/room.html',
    controller: 'RoomCtrl'
  }).otherwise({
    redirectTo: '/'
  });
});

/*
//# sourceMappingURL=app.js.map
*/
