angular.module('yellio').factory('ngRTC', function($sce) {
  return {
    getUserMediaURL: function(constraints, cb) {
      return this.getLocalMediaStream(constraints, function(err, stream) {
        var url;
        if (err) {
          return cb(err);
        } else {
          url = window.URL.createObjectURL(stream);
          return cb(null, $sce.trustAsResourceUrl(url));
        }
      });
    },
    getLocalMediaStream: function(constraints, cb) {
      var errorCallback, successCallback;
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
      errorCallback = function(err) {
        return cb(err);
      };
      successCallback = function(localMediaStream) {
        return cb(null, localMediaStream);
      };
      return navigator.getUserMedia(constraints, successCallback, errorCallback);
    },
    PeerConnection: window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection,
    SessionDescription: window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription,
    RTCIceCandidate: window.mozRTCIceCandidate || window.webkitRTCIceCandidate || window.RTCIceCandidate
  };
});

/*
//# sourceMappingURL=ngRTC.js.map
*/
