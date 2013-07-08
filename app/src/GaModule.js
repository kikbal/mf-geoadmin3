(function() {
  goog.provide('ga');
  goog.require('ga_attribution');
  goog.require('ga_backgroundlayerselector');
  goog.require('ga_contextmenu');
  goog.require('ga_map');
  goog.require('ga_mouseposition');
  goog.require('ga_print');
  goog.require('ga_scaleline');
  goog.require('ga_search');

  var module = angular.module('ga', [
    'ga_attribution',
    'ga_contextmenu',
    'ga_map',
    'ga_mouseposition',
    'ga_backgroundlayerselector',
    'ga_print',
    'ga_scaleline',
    'ga_search'
  ]);

  // Configure the $http service to remove the X-Requested-With
  // header. This is to be able to work with CORS. See
  // <http://stackoverflow.com/questions/15411818/setting-up-cors-with-angular-js>
  module.config(['$httpProvider', function($httpProvider) {
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
  }]);

})();
