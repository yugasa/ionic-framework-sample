(function () {
    "use strict";
    angular.module('forgotPin.login')
            .controller('ForgotPinController', ForgotPinController);


    ForgotPinController.inject = ['$scope', '$resource', 'auth', 'uiUtils', 'loginService', 'validationService', 'requireValidator', 'regexpValidator', 'nodeApiHelper', 'ajaxHelper', '$ionicLoading', 'storageHelper', '$state', '$timeout', 'userService', '$ionicPlatform', '$cordovaTouchID', '$translate', '$filter', 'imageHelper'];
    function ForgotPinController($scope, $resource, auth, uiUtils, loginService, validationService, requireValidator, regexpValidator, nodeApiHelper, ajaxHelper, $ionicLoading, storageHelper, $state, $timeout, userService, $ionicPlatform, $cordovaTouchID, $translate, $filter, imageHelper) {

        var vm = this;
        //This API is used to get the security questions.
        var getQuestion = nodeApiHelper + '/api/list-recovery-question';
        //This API is used to confirm question and answer.
        var matchQuestionAnswer = nodeApiHelper + '/api/forgotpin/confirm-question';
        //This API is used to reset pin.
        var resetPin = nodeApiHelper + '/api/forgotpin/reset-pin';
        //The below object declaration is used for storing all the question names which is returned from API's
        vm.forgotmodel = {};
        vm.clearSearch = clearSearch;
        vm.step2 = step2;
        vm.step3 = step3;
        vm.step6 = step6;
        vm.onfail = onfail;
        vm.onsuccess = onsuccess;
        vm.onanswerfail = onanswerfail;
        vm.onanswersuccess = onanswersuccess;
        vm.onresetfail = onresetfail;
        vm.onresetsuccess = onresetsuccess;
    
        // Below function is used to clear text when the cross button on the HTML is clicked.
        function clearSearch() {
            vm.email = '';
            vm.code = '';

        }
        
        if ($state.current.name == 'app.forgotPin3') {
            initPhoneViewModel();
        }
        /*Below fuction is used to check whether a valid email is entered. If it is correct
         then email is stored in userService for later use & moved to the next step.
         */
        function step2() {
            $timeout(function () {
                vm.infoMessage = undefined;
            }, 3000);
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (vm.email == '')
            {
                var trans = $filter('translate')('Please enter email');
                vm.infoMessage = trans;
            } else if (!re.test(vm.email))
            {
                var trans = $filter('translate')('Please enter valid email');
                vm.infoMessage = trans;


            } else {
                userService.set('rec_email', vm.email);
                $state.go('app.forgotPin3');
            }

        }
        /*Below function is used to confirm weather Q&A already set in recovery email is correct or not.
         * 1- First Question validation is performed at this stage, if no question is selected.
         * 2- Second validation of answer is performed here if no answer is entered by user.
         * 3- If match does not happen between Q and A, entered by user then validation messege will show
         * 4- If question and answer match then API will hit nnd will perform the necessary action.
         */
        function step3() {

            $timeout(function () {
                vm.infoMessage = undefined;
            }, 3000);


            if (vm.forgotmodel.initForgotInfo.question == undefined || vm.forgotmodel.initForgotInfo.question == '') {
                var trans = $filter('translate')('Please select your question');
                vm.infoMessage = trans;


            } else if (vm.answer == undefined || vm.answer == '') {
                var trans = $filter('translate')('Please enter answer');
                vm.infoMessage = trans;

            } else {
                var data =
                        {
                            email: userService.get("rec_email"),
                            question: vm.forgotmodel.initForgotInfo.question,
                            answer: vm.answer
                           


                        };
                ajaxHelper.post(matchQuestionAnswer, data, $ionicLoading, onanswersuccess, onanswerfail);

            }

        }
        function onanswersuccess(responseData) {
            $state.go('app.forgotPin6');
        }
        function onanswerfail(responseData) {


            vm.infoMessage = responseData.responseJSON.message;
            $timeout(function () {
                vm.infoMessage = undefined;
            }, 4000);
        }
       
        
        /* 1- We start validation for pin at this stage.
         * 2- If entered pin matches and is correct then else part executes where Reset Pin API is hitting
         *   and after that user will be redirected to login page for login using pin
         */
        function step6() {

            $timeout(function () {
                vm.infoMessage = undefined;
            }, 3000);
            if (vm.password == undefined || vm.password == '') {
                var trans = $filter('translate')('Please enter pin');
                vm.infoMessage = trans;

            } else if (vm.password.length < 4)
            {
                var trans = $filter('translate')('Pin should be atleast 4 digits');
                vm.infoMessage = trans;

            } else if (vm.repassword == undefined || vm.repassword == '') {
                var trans = $filter('translate')('Please re-type pin');
                vm.infoMessage = trans;

            } else if (vm.repassword != vm.password) {
                var trans = $filter('translate')('Pin does not match');
                vm.infoMessage = trans;

            } else {
                var data =
                        {
                            email: userService.get("rec_email"),
                            newPin: vm.password,
                            confirmPin: vm.repassword
                            
                        };
                ajaxHelper.post(resetPin, data, $ionicLoading, onresetsuccess, onresetfail);
            }

        }
        function onresetsuccess(responseData) {
            $state.go('app.pinlogin');
        }
        function onresetfail(responseData) {


            vm.infoMessage = responseData.responseJSON.message;
            $timeout(function () {
                vm.infoMessage = undefined;
            }, 4000);
        }
        /*
         * This function is used for getting questions from API's. 
         */
        function initPhoneViewModel()
        {
          
          var data =    {
                            recoveryEmail: userService.get("rec_email")
                            
                        };
                ajaxHelper.post(getQuestion, data, $ionicLoading, onsuccess, onfail);
               

        }
        /*Below success fucntion is used for storing response data in forgot_list
         array object for showing the drop down box for the question listing.
         */
        function onsuccess(responseData)
        {
            var data = responseData;
            var name = '';
            var initForgotInfo = {};
            vm.forgot_list = data.data;
            console.log(vm.forgot_list);
            initForgotInfo = JSON.parse(JSON.stringify(vm.forgot_list));
            console.log(initForgotInfo);
            vm.forgotmodel =
                    {
                        name: name,
                        initForgotInfo: initForgotInfo
                    };
        }
        function onfail(responseData) {
          vm.infoMessage = responseData.responseJSON.message;
            $timeout(function () {
                vm.infoMessage = undefined;
            }, 4000);
        }
        

    }

})();