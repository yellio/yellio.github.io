angular.module('yellio').factory('socket', function($rootScope) {
  var socket;
  socket = io.connect('http://yellio.herokuapp.com');
  return {
    on: function(event, cb) {
      return socket.on(event, function() {
        var args;
        args = arguments;
        return $rootScope.$apply(function() {
          return cb.apply(socket, args);
        });
      });
    },
    emit: function(event, data, cb) {
      return socket.emit(event, data, function() {
        var args;
        args = arguments;
        return $rootScope.$apply(function() {
          if (cb) {
            return cb.apply(socket, args);
          }
        });
      });
    }
  };
});

/*
//# sourceMappingURL=socket.js.map
*/
