require 'ng-cordova'

module.exports = app = angular.module 'wordpress-hybrid-client.loading', [
    require('../config').name
    'ionic'
    'ngCordova'
]

require "./loading.service.coffee"
