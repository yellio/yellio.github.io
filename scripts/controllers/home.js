angular.module('yellio').controller('HomeCtrl', function($scope, socket) {
  return socket.on('availiable rooms', function(rooms) {
    var name, users;
    return $scope.rooms = (function() {
      var _results;
      _results = [];
      for (name in rooms) {
        users = rooms[name];
        _results.push({
          name: name,
          numberOfUsers: Object.keys(users).length
        });
      }
      return _results;
    })();
  });
});

/*
//# sourceMappingURL=home.js.map
*/
