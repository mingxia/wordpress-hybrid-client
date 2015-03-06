module.exports = angular.module 'wordpress-hybrid-client.loading'
    .factory '$WPHCLoading', ($log, $WPHCConfig, $cordovaSpinnerDialog, $ionicLoading) ->
        $log.info '$WPHCLoading'

        isWV = ionic.Platform.isWebView()

        show: (text) ->
            $log.debug 'loading show'
            if !isWV
                $ionicLoading.show
                    template: text
            else
                $cordovaSpinnerDialog.show '', text, $WPHCConfig.cordova.loading.persistent

        hide: () ->
            $log.debug 'loading hide'
            if !isWV
                $ionicLoading.hide()
            else
                $cordovaSpinnerDialog.hide()
