angular.module('yellio').directive('remoteVideo', function() {
  return {
    templateUrl: 'partials/remote-video.html',
    restrict: 'AE',
    scope: {
      videoSrc: '=source'
    }
  };
});

/*
//# sourceMappingURL=remoteVideo.js.map
*/
