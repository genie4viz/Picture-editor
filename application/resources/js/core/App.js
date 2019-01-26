'use strict';

angular.module('pixie.dashboard', []);
angular.module('image.directives', []);
angular.module('pixie.admin', []);
angular.module('app', ['ui.router', 'ngMaterial', 'ngAnimate', 'ngMessages', 'afkl.lazyImage', 'pascalprecht.translate', 'angularFileUpload', 'angularUtils.directives.dirPagination', 'pixie.dashboard', 'pixie.admin', 'ImageEditor'])

.config(['$mdThemingProvider', '$translateProvider', '$compileProvider', function($mdThemingProvider, $translateProvider, $compileProvider) {
    $compileProvider.debugInfoEnabled(false);

    $mdThemingProvider.theme('default')
        .primaryPalette('deep-orange')
        .accentPalette('brown');

    if (vars.selectedLocale) {
        $translateProvider.translations(vars.selectedLocale, vars.trans);
        $translateProvider.preferredLanguage(vars.selectedLocale);
    } else {
        $translateProvider.translations('en', vars.trans);
        $translateProvider.preferredLanguage('en');
    }

    $translateProvider.useUrlLoader('trans-messages');
    $translateProvider.useSanitizeValueStrategy('escaped');
}])

.run(['$rootScope', '$state', 'users', 'utils', function($rootScope, $state, users, utils) {

    //set base url
    $rootScope.baseUrl = vars.baseUrl + '/';

    //see if we're running in a demo env
    utils.isDemo = parseInt(vars.isDemo);

    //set laravel token
    $rootScope.token = vars.token;

    //set current user
    users.assignCurrentUser(vars.user ? JSON.parse(vars.user) : false);

    //load settings
    utils.setAllSettings(vars.settings);

    //remove vars script node and delete vars object from window.
    $('#vars').remove(); delete window.vars;

    //set moment locale
    moment.locale(utils.getSetting('dateLocale', 'en'));

    //see if folder upload is supported
    var input = document.createElement('input');
    input.type="file";
    utils.folderUploadSupported = 'webkitdirectory' in input;

    var docWidth = $(document).width();
    $rootScope.isSmallScreen = docWidth <= 768;
    $rootScope.isTablet      = docWidth <= 1200 && docWidth > 768;

    var statesThatNeedAuth = ['dashboard', 'editor', 'admin'];

    $rootScope.$on('$stateChangeStart', function(e, toState, params) {

        //extract parent state name if it's a child state
        var stateName = toState.name.replace(/\..+?$/, '');

        if ( ! $state.get(stateName)) {
            e.preventDefault();
        }

        if (toState.name === 'home') {
            toState.templateUrl = utils.getHomeTemplateUrl();
            toState.controller  = utils.getHomeController();
        }
        	
        if (toState.name === 'editor') {
            if ( ! params.id) {
                e.preventDefault();
                $state.go('dashboard.albums');
            }
        }

        //check if user can access this state
        // if (statesThatNeedAuth.indexOf(stateName) > -1 && ! users.current) {
        //     e.preventDefault();
        //     $state.go('login');
        // }

        e.preventDefault();
        $state.go('dashboard.albums');

        // //only admins can access admin states
        // if (stateName == 'admin') {
        // 	if (! users.current || ! users.current.isAdmin) {
        // 		e.preventDefault();
        // 		$state.go('home');
        // 	}
        // }

        // //logged in users can't access login or register state
        // if ((stateName == 'login' || stateName == 'register') && users.current) {
        //     e.preventDefault();
        //     $state.go('dashboard.albums');
        // }

        //if registration is disabled redirect to login state
        // if (stateName == 'register' && ! utils.getSetting('enableRegistration')) {
        //     e.preventDefault();
        //     $state.go('login');
        // }

        if (stateName == 'users') {
            if ((! users.current || ! $rootScope.userCan('superuser')) && ! $rootScope.isDemo) {
                e.preventDefault();
                $state.go('dashboard');
            }
        }
    })

}]);