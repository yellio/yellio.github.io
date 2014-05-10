angular.module('yellio').controller('RoomCtrl', function($scope, $routeParams, socket, rtc, $sce) {
  $scope.cameraError = false;
  $scope.user = {};
  $scope.remoteVideos = {};
  $scope.remoteScreens = {};
  $scope.roomName = $routeParams.name;
  $scope.$on('$destroy', function() {
    return socket.emit('leave room');
  });
  rtc.getWebcamStream(function(err, webcamStream) {
    return $scope.$apply(function() {
      if (err) {
        return $scope.cameraError = true;
      } else {
        return $scope.localVideoSrc = rtc.getStreamUrl(webcamStream);
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
    delete $scope.remoteVideos[username];
    return delete $scope.remoteScreens[username];
  });
  rtc.onCall = rtc.acceptCall;
  rtc.onCallStarted = function(callData) {
    var url;
    url = rtc.getStreamUrl(callData.stream);
    return $scope.$apply(function() {
      return $scope.remoteVideos[callData.username] = url;
    });
  };
  rtc.onScreenShare = function(data) {
    var url;
    url = rtc.getStreamUrl(data.stream);
    return $scope.$apply(function() {
      return $scope.remoteScreens[data.username] = url;
    });
  };
  return $scope.shareScreen = rtc.shareScreen;
});

/*
//# sourceMappingURL=room.js.map
*/
