angular.module('yellio').controller('HomeCtrl', function($scope, socket, $location) {
  socket.on('availiable rooms', function(rooms) {
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
  return $scope.createRoom = function() {
    return $location.path('/r/' + $scope.roomName);
  };
});

/*
//# sourceMappingURL=home.js.map
*/
