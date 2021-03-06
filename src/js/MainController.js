(function() {
  goog.provide('ga_main_controller');

  var module = angular.module('ga_main_controller', [
    'pascalprecht.translate'
  ]);

  function createMap() {
    var swissExtent = [420000, 30000, 900000, 350000];
    var swissProjection = ol.proj.configureProj4jsProjection({
      code: 'EPSG:21781',
      extent: swissExtent
    });

    var resolutions = [650.0, 500.0, 250.0, 100.0, 50.0, 20.0, 10.0, 5.0, 2.5,
      2.0, 1.0, 0.5, 0.25, 0.1];

    var map = new ol.Map({
      controls: ol.control.defaults({
        attribution: false
      }),
      interactions: ol.interaction.defaults({
        altShiftDragRotate: false,
        touchRotate: false
      }),
      renderer: ol.RendererHint.CANVAS,
      view: new ol.View2D({
        projection: swissProjection,
        center: ol.extent.getCenter(swissExtent),
        resolution: 500.0,
        resolutions: resolutions
      })
    });

    return map;
  }

  /**
   * The application's main controller.
   */
module.controller('GaMainController',
  function($scope, $rootScope, $translate, $timeout, $window,  gaPermalink,
    gaBrowserSniffer) {

      var mobile = (gaBrowserSniffer.mobile) ? 'false' : 'true',
        dismiss = 'none';

      // The main controller creates the OpenLayers map object. The map object
      // is central, as most directives/components need a reference to it. So
      $scope.map = createMap();

      $rootScope.$on('gaTopicChange', function(event, topic) {
        $scope.topicId = topic.id;
      });

      $rootScope.$on('$translateChangeEnd', function() {
        $scope.langId = $translate.uses();
      });

      $scope.deviceSwitcherHref = gaPermalink.getHref({ mobile: mobile });
      $rootScope.$on('gaPermalinkChange', function() {
        $scope.deviceSwitcherHref = gaPermalink.getHref({ mobile: mobile });
      });

      $scope.globals = {
        searchFocused: false,
        homescreen: false,
        tablet: gaBrowserSniffer.mobile && !gaBrowserSniffer.phone
      };

      $timeout(function() {
        $scope.globals.homescreen = gaBrowserSniffer.ios &&
          !($window.localStorage.getItem('homescreen') == dismiss) &&
          !$window.navigator.standalone;
        $scope.$watch('globals.homescreen', function(newVal) {
          if (newVal == true) {
            return;
          }
          $window.localStorage.setItem('homescreen', dismiss);
        });
      }, 2000);


  });

})();
