angular.module('yellio').service('rtc', function($sce, socket) {
  var Peer, PeerConnection, RTCIceCandidate, SessionDescription, localScreenShareStream, localWebcamStream, peers, self;
  self = this;
  localWebcamStream = null;
  localScreenShareStream = null;
  peers = [];
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
  this.getScreenShareStream = function(cb) {
    var resources;
    resources = {
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'screen',
          maxWidth: 1280,
          maxHeight: 720
        },
        optional: []
      }
    };
    return self.getLocalMediaStream(resources, function(err, stream) {
      if (err) {
        cb(err);
      }
      localScreenShareStream = stream;
      return cb(null, localScreenShareStream);
    });
  };
  this.getWebcamStream = function(cb) {
    return self.getLocalMediaStream({
      audio: true,
      video: true
    }, function(err, stream) {
      if (err) {
        cb(err);
      }
      localWebcamStream = stream;
      return cb(null, localWebcamStream);
    });
  };
  Peer = (function() {
    function Peer(username) {
      this.username = username;
      this.isCalling = false;
      this.pc = new PeerConnection({
        iceServers: [
          {
            url: "stun:stun.l.google.com:19302"
          }
        ]
      });
      this.pc.addStream(localWebcamStream);
      if (localScreenShareStream) {
        this.pc.addStream(localScreenShareStream);
      }
      this.pc.onicecandidate = (function(event) {
        var candidate;
        if (!this.pc || !event || !event.candidate) {
          return;
        }
        if (event.switching) {
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
      socket.on('renegotiation', (function(data) {
        return this.answer(data.desc);
      }).bind(this));
      this.pc.onaddstream = (function(event) {
        if (!event) {
          return;
        }
        if (this.isCalling) {
          return self.onScreenShare({
            stream: event.stream,
            username: this.username
          });
        } else {
          this.isCalling = true;
          return self.onCallStarted({
            stream: event.stream,
            username: this.username
          });
        }
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

    Peer.prototype.renegotiate = function() {
      return this.pc.createOffer((function(desc) {
        this.pc.setLocalDescription(desc);
        return socket.emit('renegotiation request', {
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
    peers.push(peer);
    return peer.answer(offer.desc);
  };
  this.initiateCall = function(username) {
    var peer;
    peer = new Peer(username);
    peers.push(peer);
    return peer.call();
  };
  this.shareScreen = function() {
    return self.getScreenShareStream(function(err, stream) {
      var peer, _i, _len, _results;
      localScreenShareStream = stream;
      _results = [];
      for (_i = 0, _len = peers.length; _i < _len; _i++) {
        peer = peers[_i];
        peer.pc.addStream(localScreenShareStream);
        _results.push(peer.renegotiate());
      }
      return _results;
    });
  };
  this.onCall = function() {};
  this.onHang = function() {};
  this.onCallStarted = function() {};
  this.onScreenShare = function() {};
  this.rejectCall = function() {};
  return this;
});

/*
//# sourceMappingURL=rtc.js.map
*/
