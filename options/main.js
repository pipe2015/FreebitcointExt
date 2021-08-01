var app = angular.module('app', []);

app.controller('autoActive', ['$scope', 'utils', '$document', '$timeout', ($scope, utils, $document, $timeout) => {
    $scope.isActive = false;
    $scope.message = false;

    utils.isAutoEnable(isActive => {
        $scope.$apply(() => {
            $scope.isActive = isActive;
        });
    });
    
    $document.find('input').on('change', e => {
        utils.activate(e.target.checked, () => {
            $scope.$apply(() => {
                $scope.message = true;
            });
            
            $timeout(() => $scope.message = false, 1000);
        });
    });

}]);

app.factory('utils', function () {
    return {
        isAutoEnable: callback => {
            chrome.storage.sync.get('autoActive', res => {
                if('autoActive' in res && res.autoActive) return callback(true);
            });
        },
        activate: (checked, callback) => {
            chrome.storage.sync.set({autoActive: checked}, callback);
        }
    }
});


angular.element(() => angular.bootstrap(document, ['app']));