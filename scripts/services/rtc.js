angular.module('yellio').service('rtc', function($sce, socket) {
  var Peer, PeerConnection, RTCIceCandidate, SessionDescription, localStream, self;
  self = this;
  localStream = {};
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
  Peer = (function() {
    function Peer(username) {
      this.username = username;
      this.pc = new PeerConnection({
        iceServers: [
          {
            url: "stun:stun.l.google.com:19302"
          }
        ]
      });
      this.pc.addStream(localStream);
      this.pc.onicecandidate = (function(event) {
        var candidate;
        if (!this.pc || !event || !event.candidate) {
          return;
        }
        candidate = event.candidate;
        return socket.emit('send candidate', {
          candidate: candidate,
          username: this.username
        });
      }).bind(this);
      socket.on('ice candidate', (function(candidate) {
        return this.pc.addIceCandidate(new RTCIceCandidate(candidate));
      }).bind(this));
      socket.on('call accepted', (function(desc) {
        return this.pc.setRemoteDescription(new RTCSessionDescription(desc));
      }).bind(this));
      this.pc.onaddstream = (function(event) {
        if (!event) {
          return;
        }
        return self.onCallStarted(self.getStreamUrl(event.stream));
      }).bind(this);
    }

    Peer.prototype.call = function() {
      return this.pc.createOffer((function(desc) {
        this.pc.setLocalDescription(desc);
        return socket.emit('call request', {
          desc: desc,
          username: this.username
        });
      }).bind(this));
    };

    Peer.prototype.answer = function(offerDesc) {
      this.pc.setRemoteDescription(new SessionDescription(offerDesc));
      return this.pc.createAnswer((function(desc) {
        this.pc.setLocalDescription(desc);
        return socket.emit('call accept', {
          desc: desc,
          username: this.username
        });
      }).bind(this));
    };

    return Peer;

  })();
  socket.on('incoming call', function(data) {
    return self.onCall(data);
  });
  this.acceptCall = function(offer) {
    var peer;
    peer = new Peer(offer.username);
    return peer.answer(offer.desc);
  };
  this.initiateCall = function(username) {
    var peer;
    peer = new Peer(username);
    return peer.call();
  };
  this.onCall = function() {};
  this.onHang = function() {};
  this.onCallStarted = function() {};
  this.rejectCall = function() {};
  this.prepareToCall = function(cb) {
    return self.getLocalMediaStream({
      audio: true,
      video: true
    }, function(err, stream) {
      if (err) {
        cb(err);
      }
      localStream = stream;
      return cb(null, self.getStreamUrl(localStream));
    });
  };
  return this;
});

/*
//# sourceMappingURL=rtc.js.map
*/
