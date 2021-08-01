var app = angular.module('app', []);

app.controller('openOptions', ['$scope', $scope => {
    $scope.open = () => {
        chrome.runtime.openOptionsPage();
    }
}]);

app.controller('activeExt', ['$scope', '$document', '$timeout', 'utilEvents', function ($scope, $document, $timeout, utilEvents) {
    $document.find('input').on('change', e => {
        utilEvents.changeIcon(e.target.checked, () => $timeout(window.close, 500));
        utilEvents.activateExt();
    });
    
}]);

app.directive('checkPage', () => ({
    restrict: 'E',
    controller: ['$scope', 'utils', ($scope, utils) => {
        $scope.isPage = false;
        $scope.isActive = false;
        $scope.clickCount = 0;

        utils.getCurrentTab(tab => {
            if(utils.isPageFreecoint(tab)) {
                $scope.$apply(() => $scope.isPage = true);
            }
                
        });
        
        utils.getStorage('isActiveExtension', res => {
            if('isActiveExtension' in res && res.isActiveExtension) {
                $scope.$apply(() => $scope.isActive = true);
            }        
        });
        
        utils.getStorage('countRollclick', res => {
            if('countRollclick' in res) {
                $scope.$apply(() => $scope.clickCount = res.countRollclick);
            }        
        }, 'local');
    }],
    template: `
    <section class="stadis-freecoint">
        <div class="container">
            <div ng-show="isPage">
                <div class="container">
                    <div class="row">
                        <div class="col s12">
                            <p class="title">Points</p>
                        </div> 
                        <div class="col s12">
                            <form action="">
                                <div class="row">
                                    <div class="col s6">
                                        <span class="item-title">Btc points</span>
                                    </div>
                                    <div class="col s6">
                                        <span class="item-value">12</span>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col s6">
                                        <span class="item-title">Roll clicks</span>
                                    </div>
                                    <div class="col s6">
                                        <span class="item-value" ng-bind="clickCount"></span>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col s12">
                                        <!-- Switch -->
                                        <div class="switch button-active" ng-controller="activeExt">
                                            <span class="title">ACTIVE</span>
                                            <label>
                                                <input type="checkbox" ng-checked="isActive">
                                                <span class="lever"></span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <div ng-hide="isPage" class="no-page">
                Esta pagina no es compatible
            </div>
        </div>
    </section>            
    `
}));

app.factory('utils', ['freecointUrlPage', 'pageTitle', (freecointUrlPage, pageTitle) => {
    return {
        getCurrentTab: callback => {
            chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                var [tabcurrent] = tabs.filter(e => e.active);
        
                if(angular.isFunction(callback)) return callback.call(this, tabcurrent);
                
                console.log('is not function');
            });
        },
        isPageFreecoint: tab => (tab.url.indexOf(freecointUrlPage) != -1 && tab.title.indexOf(pageTitle) != -1) ? true : false,
        getStorage: (key, callback, type = 'sync') => chrome.storage[type].get(key, callback)
    }       
}]);

app.service('utilEvents', function () {
    this.inyectScript = () => {
        chrome.runtime.sendMessage({
            event: "verifyScrips"
        }, res => {
            console.log(res);
        });
    }

    this.activateExt = () => {  
        chrome.runtime.sendMessage({
            event: "activateExtension"
        }, this.inyectScript);
    }

    this.changeIcon = (check, callback) => {
        chrome.runtime.sendMessage({
            event: "changeIcon",
            content: { check }
        }, callback);
    }

    this.addEvents = () => {

    }
});

app.constant('freecointUrlPage', 'https://freebitco.in/');
app.constant('pageTitle', 'FreeBitco.in');

app.run(['utilEvents', utilEvents => {
    utilEvents.addEvents();
}]);

angular.element(() => angular.bootstrap(document, ['app']));





