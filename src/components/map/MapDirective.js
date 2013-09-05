(function() {
  goog.provide('ga_map_directive');
  goog.require('ga_permalink');

  var module = angular.module('ga_map_directive', [
    'ga_permalink'
  ]);

  module.directive('gaMap',
      function($parse, $timeout, gaPermalink, gaLayers, $http, $q) {
          return {
            restrict: 'A',
            scope: {
              map: '=gaMapMap'
            },
            link: function(scope, element, attrs) {
              var map = scope.map;

              var view = map.getView();

              // set view states based on URL query string
              var queryParams = gaPermalink.getParams();
              if (queryParams.Y !== undefined && queryParams.X !== undefined) {
                view.setCenter([+queryParams.Y, +queryParams.X]);
              }
              if (queryParams.zoom !== undefined) {
                view.setZoom(+queryParams.zoom);
              }

              if (queryParams.crosshair !== undefined) {
                var crosshair = $('<div></div>')
                  .addClass('crosshair')
                  .addClass(queryParams.crosshair);
                map.addOverlay(new ol.Overlay({
                  element: crosshair.get(0),
                  position: view.getCenter()
                }));
                gaPermalink.deleteParam('crosshair');
              }

              gaLayers.loadForTopic('ech').then(function() {
                var layer, ids;
                for (var key in queryParams) {
                  if (gaLayers.getLayer(key)) {
                    layer = key;
                    ids = queryParams[key].split(',');
                    break;
                  }
                }
                if (layer && ids) {
                  var promises = $.map(ids, function(id) {
                    return $http.get('http://mf-chsdi30t.bgdi.admin.ch/rest/services/ech/MapServer/' + layer + '/' + id);
                  });
                  $q.all(promises).then(function(results) {
                    var extent = ol.extent.createEmpty();
                    angular.forEach(results, function(result) {
                      var bbox = result.data.feature.bbox;
                      ol.extent.extend(extent, [
                        bbox[0], bbox[2], bbox[1], bbox[3]
                      ]);
                    });
                    view.fitExtent(extent, scope.map.getSize());
                  });
                }
              });


              // Update permalink based on view states. We use a timeout
              // not to incur an Angular dirty-check cycle on each view
              // change event.
              var timeoutPromise = null;
              var updatePermalink = function() {
                if (timeoutPromise !== null) {
                  $timeout.cancel(timeoutPromise);
                }
                timeoutPromise = $timeout(function() {
                  var center = view.getCenter();
                  var zoom = view.getZoom();
                  // when the directive is instantiated the view may not
                  // be defined yet.
                  if (center && zoom !== undefined) {
                    var x = center[1].toFixed(2);
                    var y = center[0].toFixed(2);
                    gaPermalink.updateParams({X: x, Y: y, zoom: zoom});
                  }
                  timeoutPromise = null;
                }, 1000);
              };
              view.on('change', updatePermalink);
              updatePermalink();

              map.addControl(new ol.control.ZoomSlider());
              map.addControl(new ol.control.ZoomToExtent());

              map.setTarget(element[0]);
            }
          };
        });
})();


