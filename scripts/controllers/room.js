angular.module('yellio').controller('RoomCtrl', function($scope, $routeParams, socket, rtc, $sce) {
  $scope.cameraError = false;
  $scope.localVideoSrc = '';
  $scope.user = {};
  $scope.remoteVideos = [];
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
        room: $scope.roomName,
        description: 'desc'
      });
    }
  };
  socket.on('room info', function(room) {
    var numberOfUsers;
    $scope.room = room;
    numberOfUsers = Object.keys(room).length;
    if (numberOfUsers > 1) {
      return rtc.initiateCall();
    }
  });
  socket.on('user joined', function(user) {
    return $scope.room[user.name] = user.resources;
  });
  socket.on('user disconnected', function(username) {
    return delete $scope.room[username];
  });
  rtc.onCall = rtc.acceptCall;
  return rtc.onCallStarted = function(videoUrl) {
    return $scope.remoteVideos.push(videoUrl);
  };
});

/*
//# sourceMappingURL=room.js.map
*/
