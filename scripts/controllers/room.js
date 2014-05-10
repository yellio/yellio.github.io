angular.module('yellio').controller('RoomCtrl', function($scope, $routeParams, socket, rtc, $sce) {
  $scope.cameraError = false;
  $scope.localVideoSrc = '';
  $scope.user = {};
  $scope.remoteVideos = {};
  $scope.roomName = $routeParams.name;
  rtc.prepareToCall(function(err, localVideoUrl) {
    return $scope.$apply(function() {
      if (err) {
        return $scope.cameraError = true;
      } else {
        return $scope.localVideoSrc = localVideoUrl;
      }
    });
  });
  $scope.joinRoom = function() {
    if ($scope.loginForm.username.$valid) {
      $scope.user.name = $scope.username;
      return socket.emit('join room', {
        name: $scope.user.name,
        room: $scope.roomName
      });
    }
  };
  socket.on('room info', function(room) {
    return $scope.room = room;
  });
  socket.on('user joined', function(user) {
    $scope.room[user.name] = user.id;
    return rtc.initiateCall(user.name);
  });
  socket.on('user disconnected', function(username) {
    delete $scope.room[username];
    return delete $scope.remoteVideos[username];
  });
  rtc.onCall = rtc.acceptCall;
  return rtc.onCallStarted = function(callData) {
    var url;
    url = rtc.getStreamUrl(callData.stream);
    return $scope.remoteVideos[callData.username] = url;
  };
});

/*
//# sourceMappingURL=room.js.map
*/
