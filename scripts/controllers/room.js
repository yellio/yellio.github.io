angular.module('yellio').controller('RoomCtrl', function($scope, $routeParams, socket, ngRTC, $sce) {
  var acceptCall, makeCall, pc, receiveCall, streamToAttach;
  $scope.formShown = true;
  $scope.user = {
    name: 'anon'
  };
  $scope.room = {};
  $scope.videos = [];
  $scope.messages = [];
  $scope.localVideoSrc = '';
  streamToAttach = {};
  pc = {};
  ngRTC.getLocalMediaStream({
    video: true,
    audio: true
  }, function(err, stream) {
    var url;
    url = window.URL.createObjectURL(stream);
    pc = new ngRTC.PeerConnection({
      iceServers: [
        {
          url: "stun:stun.l.google.com:19302"
        }
      ]
    });
    pc.addStream(stream);
    $scope.$apply(function() {
      return $scope.localVideoSrc = $sce.trustAsResourceUrl(url);
    });
    pc.onaddstream = function(event) {
      if (!event) {
        return;
      }
      url = window.URL.createObjectURL(event.stream);
      return $scope.videos.push($sce.trustAsResourceUrl(url));
    };
    return pc.onicecandidate = function(event) {
      var candidate;
      if (!pc || !event || !event.candidate) {
        return;
      }
      candidate = event.candidate;
      return socket.emit('send candidate', candidate);
    };
  });
  $scope.joinRoom = function() {
    if ($scope.loginForm.username.$valid) {
      $scope.user.name = $scope.username;
      socket.emit('join room', {
        name: $scope.user.name,
        room: $routeParams.name,
        description: 'desc'
      });
      return $scope.formShown = false;
    }
  };
  socket.on('room info', function(room) {
    var numberOfUsers;
    $scope.room = room;
    numberOfUsers = Object.keys(room).length;
    if (numberOfUsers > 1) {
      return makeCall();
    }
  });
  socket.on('user joined', function(user) {
    return $scope.room[user.name] = user.resources;
  });
  socket.on('user disconnected', function(username) {
    return delete $scope.room[username];
  });
  socket.on('incoming call', function(desc) {
    $scope.messages.push('incomming call');
    return acceptCall(desc);
  });
  socket.on('call accepted', function(desc) {
    $scope.messages.push('call was accepted');
    $scope.messages.push('call started.....');
    return receiveCall(desc);
  });
  socket.on('ice candidate', function(candidate) {
    return pc.addIceCandidate(new ngRTC.RTCIceCandidate(candidate));
  });
  makeCall = function() {
    return pc.createOffer(function(desc) {
      $scope.messages.push('calling');
      pc.setLocalDescription(desc);
      return socket.emit('call request', desc);
    });
  };
  acceptCall = function(offerDesc) {
    pc.setRemoteDescription(new ngRTC.SessionDescription(offerDesc));
    return pc.createAnswer(function(desc) {
      $scope.messages.push('accepting call');
      pc.setLocalDescription(desc);
      return socket.emit('call accept', desc);
    });
  };
  return receiveCall = function(desc) {
    return pc.setRemoteDescription(new RTCSessionDescription(desc));
  };
});

/*
//# sourceMappingURL=room.js.map
*/
