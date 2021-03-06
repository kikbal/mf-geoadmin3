(function() {
  goog.provide('ga_topic_directive');

  goog.require('ga_map_service');
  goog.require('ga_permalink');
  goog.require('ga_urlutils_service');

  var module = angular.module('ga_topic_directive', [
    'pascalprecht.translate',
    'ga_map_service',
    'ga_permalink',
    'ga_urlutils_service'
  ]);

  module.directive('gaTopic',
      function($rootScope, $http, gaPermalink, gaUrlUtils, gaLayers) {
        return {
          restrict: 'A',
          replace: true,
          templateUrl: function(element, attrs) {
            return 'components/topic/partials/topic.' +
              ((attrs.gaTopicUi == 'select') ? 'select.html' : 'html');
          },
          scope: {
            options: '=gaTopicOptions',
            map: '=gaTopicMap'
          },
          link: function(scope, element, attrs) {
            var options = scope.options;

            function isValidTopicId(id) {
              var i, len = scope.topics.length;
              for (i = 0; i < len; i++) {
                if (scope.topics[i].id == id) {
                  return true;
                }
              }
              return false;
            }

            function initTopics() {
              var topicId = gaPermalink.getParams().topic;
              if (isValidTopicId(topicId)) {
                scope.activeTopic = topicId;
              } else {
                scope.activeTopic = options.defaultTopicId;
              }
            }

            function extendLangs(langs) {
              var res = [];
              angular.forEach(langs.split(','), function(lang) {
                res.push({
                  label: angular.uppercase(lang),
                  value: lang
                });
              });
              return res;
            }

            function layerFilter(layer) {
              var id = layer.get('id');
              var isBackground = !!gaLayers.getLayer(id) &&
                  gaLayers.getLayerProperty(id, 'background');
              var isPreview = layer.preview;
              return !isBackground && !isPreview;
            }

            function removeAllLayers(map) {
              var layers = map.getLayers().getArray();
              for (var i = 0; i < layers.length; i++) {
                var layer = layers[i];
                if (layerFilter(layer)) {
                  map.removeLayer(layer);
                  i -= 1;
                }
              }
            }

            var url = gaUrlUtils.append(options.url, 'callback=JSON_CALLBACK');
            $http.jsonp(url).then(function(result) {
              scope.topics = result.data.topics;
              angular.forEach(scope.topics, function(value) {
                value.label = value.id;
                value.thumbnail = 'http://placehold.it/110x60';
                value.langs = extendLangs(value.langs);
                value.bgLayer = value.defaultBackgroundLayer;
              });
              initTopics();
            });

            // Because ng-repeat creates a new scope for each item in the
            // collection we can't use ng-click="activeTopic = topic" in
            // the template. Hence this intermediate function.
            // see: https://groups.google.com/forum/#!topic/angular/nS80gSdZBsE
            scope.setActiveTopic = function(topicId) {
              scope.activeTopic = topicId;
            };

            scope.$watch('activeTopic', function(newVal) {
              if (newVal && scope.topics) {
                var i, len = scope.topics.length;
                for (i = 0; i < len; i++) {
                  var topic = scope.topics[i];
                  if (topic.id == newVal) {
                    removeAllLayers(scope.map);
                    gaPermalink.updateParams({topic: newVal});
                    $rootScope.$broadcast('gaTopicChange', topic);
                    break;
                  }
                }
              }
            });

         }
       };
      });
})();
