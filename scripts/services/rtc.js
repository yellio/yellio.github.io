angular.module('yellio').service('rtc', function($sce, socket) {
  var PeerConnection, RTCIceCandidate, SessionDescription, pc, self;
  self = this;
  PeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
  SessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;
  RTCIceCandidate = window.mozRTCIceCandidate || window.webkitRTCIceCandidate || window.RTCIceCandidate;
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
  this.getStreamUrl = function(stream) {
    var url;
    url = window.URL.createObjectURL(stream);
    return $sce.trustAsResourceUrl(url);
  };
  this.getLocalMediaStream = function(resources, cb) {
    var errorCallback, successCallback;
    errorCallback = function(err) {
      return cb(err);
    };
    successCallback = function(localMediaStream) {
      return cb(null, localMediaStream);
    };
    return navigator.getUserMedia(resources, successCallback, errorCallback);
  };
  pc = new PeerConnection({
    iceServers: [
      {
        url: "stun:stun.l.google.com:19302"
      }
    ]
  });
  pc.onicecandidate = function(event) {
    var candidate;
    if (!pc || !event || !event.candidate) {
      return;
    }
    candidate = event.candidate;
    return socket.emit('send candidate', candidate);
  };
  socket.on('ice candidate', function(candidate) {
    return pc.addIceCandidate(new RTCIceCandidate(candidate));
  });
  socket.on('incoming call', function(desc) {
    return self.onCall(desc);
  });
  socket.on('call accepted', function(desc) {
    return pc.setRemoteDescription(new RTCSessionDescription(desc));
  });
  pc.onaddstream = function(event) {
    if (!event) {
      return;
    }
    return self.onCallStarted(self.getStreamUrl(event.stream));
  };
  this.acceptCall = function(offerDesc) {
    pc.setRemoteDescription(new SessionDescription(offerDesc));
    return pc.createAnswer(function(desc) {
      pc.setLocalDescription(desc);
      return socket.emit('call accept', desc);
    });
  };
  this.initiateCall = function() {
    return pc.createOffer(function(desc) {
      pc.setLocalDescription(desc);
      return socket.emit('call request', desc);
    });
  };
  this.onCall = function() {};
  this.onHang = function() {};
  this.onCallStarted = function() {};
  this.rejectCall = function() {
    return alert('call rejected');
  };
  this.prepareToCall = function(cb) {
    return self.getLocalMediaStream({
      audio: true,
      video: true
    }, function(err, stream) {
      if (err) {
        cb(err);
      }
      pc.addStream(stream);
      return cb(null, self.getStreamUrl(stream));
    });
  };
  return this;
});

/*
//# sourceMappingURL=rtc.js.map
*/
