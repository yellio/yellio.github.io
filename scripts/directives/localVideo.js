angular.module('yellio').directive('localVideo', function() {
  return {
    templateUrl: 'partials/local-video.html',
    restrict: 'AE',
    scope: {
      videoSrc: '=source'
    }
  };
});

/*
//# sourceMappingURL=localVideo.js.map
*/
