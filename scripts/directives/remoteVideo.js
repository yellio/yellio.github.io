angular.module('yellio').directive('remoteVideo', function() {
  return {
    templateUrl: 'partials/remote-video.html',
    restrict: 'AE',
    scope: {
      videoSrc: '=source'
    },
    link: function(scope, elem, attrs) {
      scope.fullScreen = false;
      return scope.toggleFullScreen = function() {
        return scope.fullScreen = scope.fullScreen ? false : true;
      };
    }
  };
});

/*
//# sourceMappingURL=remoteVideo.js.map
*/
